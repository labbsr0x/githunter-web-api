import moment from 'moment';
import { config } from 'node-config-ts';
import logger from '../config/logger';
import HttpClient from './http-client';

export interface Language {
  _id: string;
  name: string;
  createdAt: moment.Moment;
  updatedAt: moment.Moment;
}

interface LanguageResponse {
  languages: Language[];
}

export interface Response {
  status: number;
  data?: Language[];
  message?: string;
}

class DataProvider extends HttpClient {
  constructor() {
    const url = `${config.githunterDataProvider.host}:${config.githunterDataProvider.port}`;
    super(url, null);
  }

  public async getLanguages(): Promise<Response> {
    const path = config.githunterDataProvider.endpoints.languages;

    try {
      const responseDataProvider = await this.instance.get<LanguageResponse>(
        path,
      );

      const response: Response = {
        status: responseDataProvider.status,
        data: responseDataProvider.data.languages,
      };

      logger.info(
        `GET Request data in Gihunter-Data-Provider on path ${path} successfully!`,
      );

      return response;
    } catch (err) {
      const response: Response = {
        status: 400,
        data: undefined,
        message: err.message,
      };

      logger.error(
        `GET Request data in Gihunter-Data-Provider on path ${path} failure! ${err.message}`,
      );

      return response;
    }
  }
}

export default DataProvider;
