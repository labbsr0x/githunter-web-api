import moment from 'moment';
import { config } from 'node-config-ts';
import HttpClient from './http-client';

export interface RepositoryStats {
  dateTime: moment.Moment;
  owner: string;
  name: string;
  frequency: number;
  definitionOSS: number;
  popularity: number;
  friendly: number;
  quality: number;
  rawData: string;
  provider: string;
  type: string;
  language: string[];
}

export interface StarwsRequest {
  startDateTime: string;
  endDateTime: string;
  provider: string;
  node: string;
}

export interface StarwsResponse {
  status: number;
  data: RepositoryStats[];
}

class Starws extends HttpClient {
  constructor() {
    const url = `${config.githunterBindStarws.host}:${config.githunterBindStarws.port}`;
    super(url, null);
  }

  public async getRepositoriesStats(
    params: StarwsRequest,
  ): Promise<StarwsResponse> {
    try {
      const path = config.githunterBindStarws.endpoints.metrics;
      const response = await this.instance.get<RepositoryStats[]>(path, {
        params,
      });

      const starwsResp: StarwsResponse = {
        status: response.status,
        data: response.data,
      };

      return starwsResp;
    } catch (err) {
      return err;
    }
  }
}

export default Starws;
