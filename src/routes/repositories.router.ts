import { Router } from 'express';
import { RepositoryStats } from '../external-services/githunter-bind-starws';

import RepositoryByName, {
  DataRequest,
  ErrorResponse,
} from '../services/RepositoryByName';

const repositoriesRouter = Router();
const service = new RepositoryByName();

repositoriesRouter.get(
  '/name/:name/owner/:owner',
  async (request, response) => {
    try {
      const { owner, name } = request.params;
      const { startDateTime, endDateTime } = request.query;
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

      return response.status(200).json({ data });
    } catch (err) {
      return response.status(400).json({ error: err.message });
    }
  },
);

export default repositoriesRouter;
