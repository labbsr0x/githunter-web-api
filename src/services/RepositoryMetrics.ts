import moment from 'moment';
import { config } from 'node-config-ts';

import Starws, {
  RepositoryStats,
  StarwsRequest,
  StarwsResponse,
} from '../external-services/githunter-bind-starws';

export interface RepositoryDataRequest {
  startDateTime: moment.Moment | string; // default: 30 days ago
  endDateTime: moment.Moment | string; // default: next 30 days
  provider: string; // default: all
  limit: string; // default: 100
  languages: string | string[]; // default: all
}

export interface ErrorResponse {
  message: string;
  status: number;
}

class RepositoryMetrics {
  private starws;

  private node: string;

  private providers: string[];

  constructor() {
    this.starws = new Starws();
    this.node = config.githunterBindStarws.nodes.repositoryStats;
    this.providers = config.githunterBindStarws.providers;
  }

  public async execute(
    request: RepositoryDataRequest,
  ): Promise<RepositoryStats[] | ErrorResponse> {
    const queryParamsValidate = RepositoryMetrics.validateRequest(request);
    let dataStarws: RepositoryStats[] = await this.getData(queryParamsValidate);
    if (dataStarws && dataStarws.length === 0) {
      const e: ErrorResponse = {
        message: 'No data.',
        status: 200,
      };
      return e;
    }
    dataStarws = RepositoryMetrics.groupByUniqueRepo(dataStarws);
    dataStarws = RepositoryMetrics.sortByLastRepo(dataStarws);
    const limit = Number(queryParamsValidate.limit);
    if (queryParamsValidate.languages?.length > 0) {
      const dataStarwsFilterByLangs = RepositoryMetrics.filterRepoByLanguages(
        dataStarws,
        queryParamsValidate.languages as string[],
      );
      return dataStarwsFilterByLangs.splice(0, limit);
    }
    return dataStarws.splice(0, limit); // by default, last 100 repos OR limit ;
  }

  private static validateRequest(
    queryParams: RepositoryDataRequest,
  ): RepositoryDataRequest {
    const {
      startDateTime,
      endDateTime,
      provider,
      limit,
      languages,
    } = queryParams;

    const queryParamsValidate = queryParams;

    if (!startDateTime) {
      queryParamsValidate.startDateTime = moment()
        .subtract(30, 'days')
        .format();
    }

    if (!endDateTime) {
      queryParamsValidate.endDateTime = moment().format();
    }

    if (!provider) {
      queryParamsValidate.provider = 'all';
    }

    if (!limit) {
      queryParamsValidate.limit = '100';
    }

    if (languages) {
      queryParamsValidate.languages = (languages as string).split(',');
    }

    return queryParamsValidate;
  }

  private async getData(
    queryParams: RepositoryDataRequest,
  ): Promise<RepositoryStats[]> {
    const providers: string[] = [];
    if (queryParams.provider.match('all')) {
      this.providers.forEach(provider => {
        providers.push(provider);
      });
    }
    providers.push(queryParams.provider);

    const promises: Promise<StarwsResponse>[] = [];
    providers.forEach((provider: string) => {
      const starwsQueryParams: StarwsRequest = {
        startDateTime: queryParams.startDateTime as string,
        endDateTime: queryParams.endDateTime as string,
        provider,
        node: this.node,
      };
      const starWsResponses = this.starws.getRepositoriesStats(
        starwsQueryParams,
      );

      promises.push(starWsResponses);
    });

    const responses = await Promise.all(promises);

    let responseData: RepositoryStats[] = [];
    if (responses?.length > 0) {
      responses.forEach(response => {
        if (response.status === 200 && response.data) {
          // Make dateTime as Moment
          const repos = response.data;
          repos.map((i: RepositoryStats) => {
            const d: RepositoryStats = i;
            if (i.dateTime) {
              d.dateTime = moment(i.dateTime);
            }
            return d;
          });
          responseData = responseData.concat(repos);
        } else {
          console.log(`Error getting data from starws. \nmsg: ${response}`);
        }
      });
    }
    return responseData;
  }

  private static groupByUniqueRepo(d: RepositoryStats[]): RepositoryStats[] {
    const data: RepositoryStats[] = [];
    d.forEach(i => {
      // Getting unique owner/name and most recent by dateTime
      const unique = d
        .filter(f => f.owner === i.owner && f.name === i.name)
        .reduce((a, b) => (a.dateTime.isAfter(b.dateTime) ? a : b));
      // check if already exists in array
      if (!data.some(elem => elem === unique)) {
        data.push(unique);
      }
    });
    return data;
  }

  private static sortByLastRepo(data: RepositoryStats[]): RepositoryStats[] {
    // Sort the array by suming all dimensions
    const sortedData = data.sort((a, b) => {
      const aSum =
        a.frequency + a.definitionOSS + a.popularity + a.friendly + a.quality;
      const bSum =
        b.frequency + b.definitionOSS + b.popularity + b.friendly + b.quality;
      return bSum - aSum;
    });
    return sortedData;
  }

  private static filterRepoByLanguages(
    repos: RepositoryStats[],
    languages: string[],
  ): RepositoryStats[] {
    const data: RepositoryStats[] = [];
    repos.forEach(repository => {
      if (repository.language?.length) {
        const interception = languages.filter(value =>
          repository.language.includes(value),
        );
        if (interception.length) {
          data.push(repository);
        }
      }
    });
    return data;
  }
}

export default RepositoryMetrics;
