import moment from 'moment';
import { config } from 'node-config-ts';
import logger from '../config/logger';
import HttpClient from './http-client';

export interface UserStats {
  score: number;
  name: string;
  user: string;
  owner: string;
  thing: string;
  node: string;
  schedulerCode: string;
  ruler: number;
  starsReceived: number;
  commits: number;
  pullRequests: number;
  issuesOpened: number;
  contributedRepositories: number;
  updatedAt: moment.Moment;
  id: string;
}

export interface UserStatsResponse {
  data: UserStats[];
}

export interface ScoreResponse {
  status?: number;
  code?: string;
  message?: string;
  data?: UserStats[];
  error?: string;
}

class Score extends HttpClient {
  constructor() {
    const url = `${config.githunterUserScore.host}:${config.githunterUserScore.port}`;
    super(url, null);
  }

  public async getUsersStats(): Promise<ScoreResponse> {
    const path = config.githunterUserScore.endpoints.score;

    try {
      const response = await this.instance.get<UserStatsResponse>(path);

      if (!response) {
        const scoreResp: ScoreResponse = {
          status: 204, // reponse empty!
        };

        logger.info(
          `GET Request data in Gihunter-Bind on path ${path} , but no content...`,
        );
        return scoreResp;
      }

      const scoreResp: ScoreResponse = {
        status: 200, // reponse it's okay!
        data: response.data.data,
      };

      logger.info(
        `GET Request data in Gihunter-Bind on path ${path} successfully!`,
      );
      return scoreResp;
    } catch (err) {
      const scoreResp: ScoreResponse = {
        status: 400, // reponse is not okay!
        data: [],
        message: err.message,
      };

      logger.error(
        `GET Request data in Gihunter-Bind on path ${path} failure! ${err.message}`,
      );
      return scoreResp;
    }
  }
}

export default Score;
