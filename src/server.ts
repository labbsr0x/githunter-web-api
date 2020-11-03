import express from 'express';
import cors from 'cors';
import { config } from 'node-config-ts';

import routes from './routes';
import logger from './config/logger';

const app = express();

const startApp = () => {
  const { port } = config.server;

  app.listen(port, () => {
    logger.info(`Server started on localhost: ${port}`);
  });
};

const initRoutes = () => {
  app.use(routes);
};

const configureApp = () => {
  app.use(express.json());
  app.use(cors());
};

const run = () => {
  configureApp();
  initRoutes();
  startApp();
};

run();
