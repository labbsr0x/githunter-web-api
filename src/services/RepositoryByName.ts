import moment from 'moment';
import { config } from 'node-config-ts';
import logger from '../config/logger';

import Starws, {
  RepositoryStats,
  StarwsRequest,
  StarwsResponse,
} from '../external-services/githunter-bind-starws';

import { ErrorResponse } from '../routes/repositories.router';

export interface DataRequest {
  owner: string;
  name: string;
  startDateTime: string;
  endDateTime: string;
}

class RepositoryByName {
  private starws;

  private node: string;

  private providers: string[];

  constructor() {
    this.starws = new Starws();
    this.node = config.githunterBindStarws.nodes.repositoryStats;
    this.providers = config.githunterBindStarws.providers;
  }

  public async execute(
    data: DataRequest,
  ): Promise<RepositoryStats[] | ErrorResponse> {
    if (RepositoryByName.validateRequest(data) == null) {
      const e: ErrorResponse = {
        message: 'Invalid Request data',
        status: 200,
      };
      return e;
    }

    let dataStarws = await this.getData(data);
    if (dataStarws?.length === 0) {
      const e: ErrorResponse = {
        status: 204,
      };
      return e;
    }

    dataStarws = RepositoryByName.filterByNameRepository(
      dataStarws,
      data.owner,
      data.name,
    );
    if (dataStarws?.length === 0) {
      const e: ErrorResponse = {
        status: 204,
      };
      return e;
    }

    const repoHistoricOrdened = RepositoryByName.sortByDateTime(dataStarws);
    return repoHistoricOrdened;
  }

  private static validateRequest(d: DataRequest): DataRequest | null {
    const theDate: DataRequest = d;
    if (!theDate.owner || !theDate.name) {
      return null;
    }

    if (!theDate.startDateTime) {
      theDate.startDateTime = moment().subtract(1, 'months').format();
    }

    if (!theDate.endDateTime) {
      theDate.endDateTime = moment().format();
    }

    return theDate;
  }

  private async getData(data: DataRequest): Promise<RepositoryStats[]> {
    const qs = <StarwsRequest>(<unknown>data);
    qs.node = this.node;

    const promises: Promise<StarwsResponse>[] = [];
    this.providers.forEach(provider => {
      qs.provider = provider;
      const starWsResponses = this.starws.getRepositoriesStats(qs);
      promises.push(starWsResponses);
    });
    const responses = await Promise.all(promises);

    let responseData: RepositoryStats[] = [];
    if (responses && responses.length > 0) {
      responses.forEach(response => {
        if (response.status === 204) {
          logger.info(`Oooops, no data content in AgroWS...retry later! ;).`);
        } else if (response.status === 200 && response.data) {
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

  private static filterByNameRepository(
    d: RepositoryStats[],
    owner: string,
    name: string,
  ): RepositoryStats[] {
    let repoHistoric: RepositoryStats[] = [];
    repoHistoric = d.filter(i => i.owner === owner && i.name === name);
    return repoHistoric;
  }

  private static sortByDateTime(
    repoHistoric: RepositoryStats[],
  ): RepositoryStats[] {
    const historicOrdened = repoHistoric.sort((a, b) =>
      b.dateTime.diff(a.dateTime),
    );
    return historicOrdened;
  }
}

export default RepositoryByName;
