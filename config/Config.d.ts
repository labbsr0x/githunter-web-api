/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    server: Server
    starws: Starws
  }
  interface Server {
    url: string
    port: number
    baseDir: string
  }

  interface StarwsEndpoints {
    metrics: string;
  }

  interface Starws {
    host: string;
    port: string;
    endpoints: StarwsEndpoints
  }

  export const config: Config
  export type Config = IConfig
}
