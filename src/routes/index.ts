import { Router } from 'express';

import repositoriesRouter from './repositories.routes';
// import services to use instance on routes

const routes = Router();

routes.use('/repositories', repositoriesRouter);

export default routes;
