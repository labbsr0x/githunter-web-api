import { Router } from 'express';

import repositoriesRouter from './repositories.routes';

const routes = Router();

routes.use('/repositories', repositoriesRouter);

export default routes;
