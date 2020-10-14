import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ParsedQs } from 'qs';

abstract class HttpClient {
  private instance: AxiosInstance;

  constructor(baseURL: string, headers: Record<string, string> | null) {
    const headerDefault = { 'Content-type': 'application/json' };

    this.instance = axios.create({
      baseURL,
      timeout: 120000,
      headers: headers || headerDefault,
    });
  }

  protected get(
    path: string,
    params: Record<string, string> | ParsedQs | undefined,
  ): Promise<AxiosResponse> {
    return this.instance.get(path, {
      params,
    });
  }

  protected post(path: string, payload: string): Promise<AxiosResponse> {
    return this.instance.post(path, {
      payload,
    });
  }
}

export default HttpClient;
