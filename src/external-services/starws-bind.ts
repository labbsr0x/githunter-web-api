import axios, { AxiosResponse } from 'axios';

import { config } from 'node-config-ts';

export interface QueryParameters {
  startDateTime: string;
  endDateTime: string;
  provider: string;
  node: string;
}

class Starws {
  private apiClient = axios.create({
    baseURL: `${config.starws.host}:${config.starws.port}`,
    timeout: 120000,
    headers: { 'Content-type': 'application/json' },
  });

  public async getRepositoriesStats4Bind(
    params: QueryParameters,
  ): Promise<AxiosResponse | null> {
    try {
      const response = await this.apiClient.get(
        config.starws.endpoints.metrics,
        {
          params,
        },
      );
      return response;
    } catch (err) {
      return err;
    }
  }
}

export default Starws;
