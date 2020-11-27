import { Router } from 'express';
import repositoriesRouter from './repositories.router';
import languagesRouter from './languages.router';
import usersRouter from './users.router';

const routes = Router();

routes.use('/repositories', repositoriesRouter);
routes.use('/languages', languagesRouter);
routes.use('/users', usersRouter);

export default routes;
