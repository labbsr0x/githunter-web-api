import { Router } from 'express';
import logger from '../config/logger';
import { RepositoryStats } from '../external-services/githunter-bind-starws';

import RepositoryByName, { DataRequest } from '../services/RepositoryByName';

import RepositoryMetrics, {
  RepositoryDataRequest,
} from '../services/RepositoryMetrics';

export interface ErrorResponse {
  status: number;
  message?: string;
}

const repositoriesRouter = Router();
const service = new RepositoryByName();
const metricsService = new RepositoryMetrics();

repositoriesRouter.get(
  '/name/:name/owner/:owner',
  async (request, response) => {
    try {
      const { owner, name } = request.params;
      const filters = request.query;
      const startDateTime = filters.startDateTime as string;
      const endDateTime = filters.endDateTime as string;
      const repositoryRequest: DataRequest = {
        owner,
        name,
        startDateTime,
        endDateTime,
      };

      const data: RepositoryStats[] | ErrorResponse = await service.execute(
        repositoryRequest,
      );

      if ('status' in data) {
        return response
          .status((data as ErrorResponse).status)
          .json({ message: (data as ErrorResponse).message });
      }

      logger.info(
        `GET Request to Githunter-Web-API in root path to get history of metrics of one repository successfully!`,
      );
      return response.status(200).json(data);
    } catch (err) {
      logger.error(
        `GET Request to Githunter-Web-API in root path to get history of metrics of one repository failure! ${err.message}`,
      );
      return response.status(400).json({ error: err.message });
    }
  },
);

repositoriesRouter.get('/', async (request, response) => {
  const filters = request.query;
  const startDateTime = filters.startDateTime as string;
  const endDateTime = filters.endDateTime as string;
  const providers = filters.providers as string[];
  const limit = filters.limit as string;
  const languages = filters.languages as string[];
  const filtersString = filters.filtersString as string;

  try {
    const repositoryRequest: RepositoryDataRequest = {
      startDateTime,
      endDateTime,
      providers,
      limit,
      languages,
      filtersString,
    };

    const data:
      | RepositoryStats[]
      | ErrorResponse = await metricsService.execute(repositoryRequest);

    if ('status' in data) {
      return response
        .status((data as ErrorResponse).status)
        .json({ message: (data as ErrorResponse).message });
    }

    if (filtersString) {
      logger.info(
        `GET Request to Githunter-Web-API in root path to get metrics of all repositories with filter: ${filtersString} successfully!`,
      );
    } else {
      logger.info(
        `GET Request to Githunter-Web-API in root path to get metrics of all repositories successfully!`,
      );
    }

    return response.status(200).json(data);
  } catch (err) {
    if (filtersString) {
      logger.info(
        `GET Request to Githunter-Web-API in root path to get metrics of all repositories with filter: ${filtersString} failure! ${err.message}`,
      );
    } else {
      logger.error(
        `GET Request to Githunter-Web-API in root path to get metrics of all repositories failure! ${err.message}`,
      );
    }
    return response.status(500).send({ error: err.message });
  }
});

export default repositoriesRouter;
