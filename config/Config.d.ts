/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    server: Server
  }
  interface Server {
    url: string
    port: number
    baseDir: string
  }
  export const config: Config
  export type Config = IConfig
}
