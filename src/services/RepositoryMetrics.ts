import moment from 'moment';
import { config } from 'node-config-ts';
import logger from '../config/logger';

import Starws, {
  RepositoryStats,
  StarwsRequest,
  StarwsResponse,
} from '../external-services/githunter-bind-starws';

export interface RepositoryDataRequest {
  startDateTime: moment.Moment | string; // default: 30 days ago
  endDateTime: moment.Moment | string; // default: next 30 days
  providers: string[]; // default: all
  limit: string; // default: 100
  languages: string[]; // default: all
  filtersString?: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
}

class RepositoryMetrics {
  private starws;

  private node: string;

  private providers: string[];

  private limitDefault: string;

  private daysDefault: number;

  constructor() {
    this.starws = new Starws();
    this.node = config.githunterBindStarws.nodes.repositoryStats;
    this.providers = config.githunterBindStarws.providers;
    this.limitDefault = config.githunterBindStarws.limitDefault;
    this.daysDefault = config.githunterBindStarws.quantityDaysDefault;
  }

  public async execute(
    request: RepositoryDataRequest,
  ): Promise<RepositoryStats[] | ErrorResponse> {
    const queryParamsValidate = this.validateRequest(request);
    let dataStarws: RepositoryStats[] = await this.getData(queryParamsValidate);

    if (dataStarws && dataStarws.length === 0) {
      const e: ErrorResponse = {
        message: 'No data.',
        status: 204,
      };
      return e;
    }

    dataStarws = RepositoryMetrics.groupByUniqueRepo(dataStarws);
    dataStarws = RepositoryMetrics.sortByLastRepo(dataStarws);

    const limit = Number(queryParamsValidate.limit);

    // Filter by language
    if (queryParamsValidate.languages?.length > 0) {
      const dataStarwsFilterByLangs = RepositoryMetrics.filterRepoByLanguages(
        dataStarws,
        queryParamsValidate.languages as string[],
      );
      // if is empty
      if (dataStarwsFilterByLangs && dataStarwsFilterByLangs.length === 0) {
        const e: ErrorResponse = {
          message: 'No data.',
          status: 204,
        };
        return e;
      }

      return dataStarwsFilterByLangs.splice(0, limit);
    }

    // Filter by repository name or owner or both
    if (queryParamsValidate.filtersString) {
      const dataStarwsFilterByNameOwner = RepositoryMetrics.filterByNameOwner(
        dataStarws,
        queryParamsValidate.filtersString,
      );
      // if is empty
      if (
        dataStarwsFilterByNameOwner &&
        dataStarwsFilterByNameOwner.length === 0
      ) {
        const e: ErrorResponse = {
          message: 'No data.',
          status: 204,
        };
        return e;
      }

      return dataStarwsFilterByNameOwner.splice(0, limit);
    }
    // No more filters, return
    return dataStarws.splice(0, limit); // by default, last 100 repos OR limit ;
  }

  private validateRequest(
    queryParams: RepositoryDataRequest,
  ): RepositoryDataRequest {
    const {
      startDateTime,
      endDateTime,
      providers,
      limit,
      languages,
    } = queryParams;

    const queryParamsValidate = queryParams;

    if (!startDateTime) {
      queryParamsValidate.startDateTime = moment()
        .subtract(30, 'days')
        .subtract(this.daysDefault, 'days')
        .format();
    }

    if (!endDateTime) {
      queryParamsValidate.endDateTime = moment().format();
    }

    if (!providers || providers.length === 0) {
      queryParamsValidate.providers = this.providers;
    }

    if (!limit) {
      queryParamsValidate.limit = this.limitDefault;
    }

    if (languages) {
      queryParamsValidate.languages = languages;
    }

    return queryParamsValidate;
  }

  private async getData(
    queryParams: RepositoryDataRequest,
  ): Promise<RepositoryStats[]> {
    const promises: Promise<StarwsResponse>[] = [];
    queryParams.providers.forEach((provider: string) => {
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
          logger.error(`Error getting data from starws. ${response.message}`);
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

  private static filterByNameOwner(
    data: RepositoryStats[],
    filterString: string,
  ): RepositoryStats[] | never[] {
    const reposFiltered: RepositoryStats[] = data.filter(
      repository =>
        repository.name.includes(filterString) ||
        repository.owner.includes(filterString),
    );
    return reposFiltered;
  }
}

export default RepositoryMetrics;
