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
    endpoints: EndpointsUserScore
    limitDefault: string
  }

  interface EndpointsUserScore {
    score: string
    scoreUser: string
  }
  interface GithunterDataProvider {
    host: string
    port: number
    endpoints: EndpointsDataProvider
  }
  interface EndpointsDataProvider {
    languages: string
  }
  interface GithunterBindStarws {
    host: string
    port: number
    endpoints: EndpointsBindStarws
    nodes: Nodes
    providers: string[]
    limitDefault: string
    quantityDaysDefault: number
  }
  interface Nodes {
    repositoryStats: string
  }
  interface EndpointsBindStarws {
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
