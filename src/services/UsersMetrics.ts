import moment from 'moment';
import { config } from 'node-config-ts';
import logger from '../config/logger';

import Score, {
  ScoreResponse,
  UserStats,
} from '../external-services/githunter-score';

import { ErrorResponse } from '../routes/users.router';

export interface UserDataRequest {
  username?: string;
  limit: string; // default: 100
}

class UserMetrics {
  private score;

  private limitDefault: string;

  constructor() {
    this.score = new Score();
    this.limitDefault = config.githunterUserScore.limitDefault;
  }

  public async execute(
    request: UserDataRequest,
  ): Promise<UserStats[] | ErrorResponse> {
    const queryParamsValidate = this.validateRequest(request);
    let dataScore: UserStats[] = await this.getData();

    if (dataScore && dataScore.length === 0) {
      const e: ErrorResponse = {
        status: 204,
      };
      return e;
    }

    dataScore = UserMetrics.sortByScore(dataScore);

    const limit = Number(queryParamsValidate.limit);

    // Filter by username
    if (queryParamsValidate.username) {
      const scoreFilterByUsername = UserMetrics.filterByUsername(
        dataScore,
        queryParamsValidate.username as string,
      );
      // if is empty
      if (scoreFilterByUsername && scoreFilterByUsername.length === 0) {
        const e: ErrorResponse = {
          status: 204,
        };
        return e;
      }

      return scoreFilterByUsername.splice(0, limit);
    }

    return dataScore.splice(0, limit); // by default, last 100 users OR limit ;
  }

  private validateRequest(queryParams: UserDataRequest): UserDataRequest {
    const { limit } = queryParams;

    const queryParamsValidate = queryParams;

    if (!limit) {
      queryParamsValidate.limit = this.limitDefault;
    }

    return queryParamsValidate;
  }

  private async getData(): Promise<UserStats[]> {
    const response: ScoreResponse = await this.score.getUsersStats();

    let responseData: UserStats[] = [];
    if (response.status === 204) {
      logger.info(`Oooops, no data content in AgroWS...retry later! ;).`);
    } else if (response.status === 200 && response.data) {
      // Make dateTime as Moment
      const users = response.data as UserStats[];
      users.map((i: UserStats) => {
        const d: UserStats = i;
        if (i.updatedAt) {
          d.updatedAt = moment(i.updatedAt);
        }
        return d;
      });
      responseData = responseData.concat(users);
    } else {
      logger.error(`Error getting data from starws. ${response.message}`);
    }

    return responseData;
  }

  private static sortByScore(repoHistoric: UserStats[]): UserStats[] {
    const historicOrdened = repoHistoric.sort((a, b) => b.score - a.score);
    return historicOrdened;
  }

  private static filterByUsername(
    data: UserStats[],
    filterString: string,
  ): UserStats[] | never[] {
    const userFiltered: UserStats[] = data.filter(user =>
      user.user.includes(filterString),
    );
    return userFiltered;
  }
}

export default UserMetrics;
