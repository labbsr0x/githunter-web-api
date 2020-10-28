import moment from 'moment';
import { config } from 'node-config-ts';

import Starws, {
  RepositoryStats,
  StarwsRequest,
  StarwsResponse,
} from '../external-services/githunter-bind-starws';

export interface FilterStringDataRequest {
  filterString: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
}

class RepositoriesFilterString {
  private starws;

  private node: string;

  private providers: string[];

  private limit: number;

  constructor() {
    this.starws = new Starws();
    this.node = config.githunterBindStarws.nodes.repositoryStats;
    this.providers = config.githunterBindStarws.providers;
    this.limit = config.githunterBindStarws.limit;
  }

  public async execute(
    request: FilterStringDataRequest,
  ): Promise<RepositoryStats[] | ErrorResponse> {
    if (!request || !request.filterString) {
      const e: ErrorResponse = {
        message: 'Invalid request data',
        status: 200,
      };
      return e;
    }
    const queryParamsValidate = RepositoriesFilterString.validateParamsRequest();
    let dataStarws = await this.getData(queryParamsValidate);
    dataStarws = RepositoriesFilterString.groupByUniqueRepo(dataStarws);
    dataStarws = RepositoriesFilterString.sortByLastRepo(dataStarws);
    dataStarws = RepositoriesFilterString.searchByPathName(
      dataStarws,
      request.filterString,
    );

    if (dataStarws.length === 0) {
      const e: ErrorResponse = {
        message: 'There are no repositories with this name!',
        status: 400,
      };
      return e;
    }
    return dataStarws.splice(0, this.limit);
  }

  private static validateParamsRequest(): StarwsRequest {
    const queryParamsValidate: StarwsRequest = {
      startDateTime: moment().subtract(365, 'days').format(),
      endDateTime: moment().format(),
      provider: '',
      node: '',
    };

    return queryParamsValidate;
  }

  private async getData(
    queryParams: StarwsRequest,
  ): Promise<RepositoryStats[]> {
    const promises: Promise<StarwsResponse>[] = [];
    this.providers.forEach((provider: string) => {
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

  private static searchByPathName(
    data: RepositoryStats[],
    filterString: string,
  ): RepositoryStats[] | never[] {
    const reposFiltered: RepositoryStats[] = [];
    data.forEach(repository => {
      if (repository.name.includes(filterString)) {
        reposFiltered.push(repository);
      }
      if (repository.owner.includes(filterString)) {
        reposFiltered.push(repository);
      }
    });
    return reposFiltered;
  }
}

export default RepositoriesFilterString;
