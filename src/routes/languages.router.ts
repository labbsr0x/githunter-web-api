import { Router } from 'express';
import logger from '../config/logger';
import DataProvider from '../external-services/githunter-data-provider';

export interface ErrorResponse {
  status: number;
  message?: string;
}

const languagesRouter = Router();
const dataProvider = new DataProvider();

languagesRouter.get('/', async (request, response) => {
  try {
    const res = await dataProvider.getLanguages();

    logger.info(
      `GET Request to Githunter-Web-API in path /languages to get languages present on data-provider successfully!`,
    );

    return response.status(res.status).json(res.data);
  } catch (err) {
    logger.error(
      `GET Request to Githunter-Web-API in path /languages to get languages present on data-provider failure! ${err.message}`,
    );

    return response.status(400).json({ error: err.message });
  }
});

export default languagesRouter;
