import axios, { AxiosInstance, AxiosResponse } from 'axios';

abstract class HttpClient {
  protected instance: AxiosInstance;

  constructor(baseURL: string, headers: Record<string, string> | null) {
    const headerDefault = { 'Content-type': 'application/json' };

    this.instance = axios.create({
      baseURL,
      timeout: 120000,
      headers: headers || headerDefault,
    });

    this.initializeResponseInterceptor();
  }

  private initializeResponseInterceptor = () => {
    this.instance.interceptors.response.use(
      this.handleResponse,
      this.handleError,
    );
  };

  private handleResponse = (response: AxiosResponse) => response;

  protected handleError = (error: any) => Promise.reject(error);
}

export default HttpClient;
