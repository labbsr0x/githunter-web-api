import { Router } from 'express';
import repositoriesRouter from './repositories.router';
import languagesRouter from './languages.router';

const routes = Router();

routes.use('/repositories', repositoriesRouter);
routes.use('/languages', languagesRouter);

export default routes;
