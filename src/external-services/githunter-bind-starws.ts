import moment from 'moment';
import { config } from 'node-config-ts';
import logger from '../config/logger';
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
  data?: RepositoryStats[];
  message?: string;
}

class Starws extends HttpClient {
  constructor() {
    const url = `${config.githunterBindStarws.host}:${config.githunterBindStarws.port}`;
    super(url, null);
  }

  public async getRepositoriesStats(
    params: StarwsRequest,
  ): Promise<StarwsResponse> {
    const path = config.githunterBindStarws.endpoints.metrics;
    try {
      const response = await this.instance.get<RepositoryStats[]>(path, {
        params,
      });

      if (!response) {
        const starwsResp: StarwsResponse = {
          status: 204, // reponse empty!
        };

        logger.info(
          `GET Request data in Gihunter-Bind on path ${path} , but no content...`,
        );
        return starwsResp;
      }

      const starwsResp: StarwsResponse = {
        status: 200, // reponse it's okay!
        data: response.data,
      };

      logger.info(
        `GET Request data in Gihunter-Bind on path ${path} successfully!`,
      );
      return starwsResp;
    } catch (err) {
      const starwsResp: StarwsResponse = {
        status: 400, // reponse is not okay!
        data: [],
        message: err.message,
      };

      logger.error(
        `GET Request data in Gihunter-Bind on path ${path} failure! ${err.message}`,
      );
      return starwsResp;
    }
  }
}

export default Starws;
