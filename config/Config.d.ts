/* tslint:disable */
/* eslint-disable */
declare module "node-config-ts" {
  interface IConfig {
    server: Server
    githunterBindStarws: GithunterBindStarws
    githunterDataProvider: GithunterDataProvider
    githunterUserScore: GithunterUserScore
  }
  interface GithunterUserScore {
    host: string
    port: number
    endpoints: Endpoints3
    limitDefault: string
  }
  interface Endpoints3 {
    score: string
    scoreUser: string
  }
  interface GithunterDataProvider {
    host: string
    port: number
    endpoints: Endpoints2
  }
  interface Endpoints2 {
    languages: string
    providers: string
  }
  interface GithunterBindStarws {
    host: string
    port: number
    endpoints: Endpoints
    nodes: Nodes
    providers: string[]
    limitDefault: string
    quantityDaysDefault: number
  }
  interface Nodes {
    repositoryStats: string
    userStats: string
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
