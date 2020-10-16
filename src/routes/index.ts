import { Router } from 'express';
import repositoriesRouter from './repositories.router';

const routes = Router();

routes.use('/repositories', repositoriesRouter);

export default routes;
