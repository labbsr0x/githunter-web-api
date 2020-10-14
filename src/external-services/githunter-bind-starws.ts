import { AxiosError, AxiosResponse } from 'axios';
import { config } from 'node-config-ts';
import { ParsedQs } from 'qs';
import HttpClient from './http-client';

interface RepositoryStats {
  dateTime: string;
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

class Starws extends HttpClient {
  constructor() {
    const url = `${config.githunterBindStarws.host}:${config.githunterBindStarws.port}`;
    super(url, null);
  }

  public async getRepositoriesStats(
    params: ParsedQs,
  ): Promise<AxiosResponse<RepositoryStats[] | AxiosError>> {
    try {
      const path = config.githunterBindStarws.endpoints.metrics;
      const response = await this.get(path, params);
      return response;
    } catch (err) {
      return err;
    }
  }
}

export default Starws;
