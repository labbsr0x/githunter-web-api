import { Router } from 'express';
import { RepositoryStats } from '../external-services/githunter-bind-starws';

import RepositoryByName, {
  DataRequest,
  ErrorResponse,
} from '../services/RepositoryByName';

import RepositoryMetrics, {
  RepositoryDataRequest,
} from '../services/RepositoryMetrics';

import RepositoriesFilterString, {
  FilterStringDataRequest,
} from '../services/RepositoriesByFilterString';

const repositoriesRouter = Router();
const service = new RepositoryByName();
const metricsService = new RepositoryMetrics();
const filterStringService = new RepositoriesFilterString();

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

      return response.status(200).json(data);
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  },
);

repositoriesRouter.get('/', async (request, response) => {
  try {
    const filters = request.query;
    const startDateTime = filters.startDateTime as string;
    const endDateTime = filters.endDateTime as string;
    const provider = filters.provider as string;
    const limit = filters.limit as string;
    const languages = filters.languages as string;
    const repositoryRequest: RepositoryDataRequest = {
      startDateTime,
      endDateTime,
      provider,
      limit,
      languages,
    };

    const data:
      | RepositoryStats[]
      | ErrorResponse = await metricsService.execute(repositoryRequest);

    if ('status' in data) {
      return response
        .status((data as ErrorResponse).status)
        .json({ message: (data as ErrorResponse).message });
    }

    return response.status(200).json(data);
  } catch (err) {
    return response.status(500).send({ error: err.message });
  }
});

repositoriesRouter.get(
  '/filterstring/:filterstring',
  async (request, response) => {
    try {
      const filters = request.params;
      const filterString = filters.filterstring as string;

      const repositoryRequest: FilterStringDataRequest = {
        filterString,
      };

      const data:
        | RepositoryStats[]
        | ErrorResponse = await filterStringService.execute(repositoryRequest);

      if ('status' in data) {
        return response
          .status((data as ErrorResponse).status)
          .json({ message: (data as ErrorResponse).message });
      }

      return response.status(200).json(data);
    } catch (err) {
      return response.status(500).send({ error: err.message });
    }
  },
);

export default repositoriesRouter;
