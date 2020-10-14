/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    server: Server
    githunterBindStarws: GithunterBindStarws
  }
  interface GithunterBindStarws {
    host: string
    port: number
    endpoints: Endpoints
  }
  interface Endpoints {
    metrics: string
  }
  interface Server {
    url: string
    port: number
    baseDir: string
  }
  export const config: Config
  export type Config = IConfig
}
