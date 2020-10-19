import axios, { AxiosInstance } from 'axios';

abstract class HttpClient {
  protected instance: AxiosInstance;

  constructor(baseURL: string, headers: Record<string, string> | null) {
    const headerDefault = { 'Content-type': 'application/json' };

    this.instance = axios.create({
      baseURL,
      timeout: 120000,
      headers: headers || headerDefault,
    });
  }
}

export default HttpClient;
