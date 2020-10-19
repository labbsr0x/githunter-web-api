import moment from 'moment';
import { config } from 'node-config-ts';

import Starws, {
  RepositoryStats,
  StarwsRequest,
} from '../external-services/githunter-bind-starws';

export interface DataRequest {
  owner: string;
  name: string;
  startDateTime: string;
  endDateTime: string;
}

export interface ErrorResponse {
  message: string;
  status: number;
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
    if (dataStarws && dataStarws.length === 0) {
      const e: ErrorResponse = {
        message: 'No data.',
        status: 200,
      };
      return e;
    }

    dataStarws = RepositoryByName.filter(dataStarws);

    return dataStarws;
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

    const promises: Promise<RepositoryStats[]>[] = [];
    this.providers.forEach(p => {
      qs.provider = p;
      promises.push(this.starws.getRepositoriesStats(qs));
    });
    const responses = await Promise.all(promises);

    let responseData: RepositoryStats[] = [];
    if (responses && responses.length > 0) {
      responses.forEach(r => {
        if (r.status === 200 && r.data && r.data.data) {
          // Make dateTime as Moment
          r.data.data.map((i: RepositoryStats) => {
            const d: RepositoryStats = i;
            if (i.dateTime) {
              d.dateTime = moment(i.dateTime);
            }
            return d;
          });
          responseData = responseData.concat(r.data.data);
        } else {
          console.log('Error getting data from starws.');
          console.log(r);
        }
      });
    }
    return responseData;
  }

  private static filter(d: RepositoryStats[]): RepositoryStats[] {
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
}

export default RepositoryByName;
