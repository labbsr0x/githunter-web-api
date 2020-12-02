import { Router } from 'express';
import logger from '../config/logger';
import { UserStats } from '../external-services/githunter-score';
import UserMetrics, { UserDataRequest } from '../services/UsersMetrics';

export interface ErrorResponse {
  status: number;
  message?: string;
}

const usersRouter = Router();
const metricsService = new UserMetrics();

usersRouter.get('/', async (request, response) => {
  const filters = request.query;
  const username = filters.username as string;
  const limit = filters.limit as string;

  try {
    const userRequest: UserDataRequest = {
      username,
      limit,
    };
    const data: UserStats[] | ErrorResponse = await metricsService.execute(
      userRequest,
    );

    if ('status' in data) {
      return response
        .status((data as ErrorResponse).status)
        .json({ message: (data as ErrorResponse).message });
    }

    logger.info(
      `GET Request to Githunter-Web-API in root path to get score of all users successfully!`,
    );

    return response.status(200).json(data);
  } catch (err) {
    logger.error(
      `GET Request to Githunter-Web-API in root path to get score of all users failure! ${err.message}`,
    );

    return response.status(500).send({ error: err.message });
  }
});

export default usersRouter;
