import { Application } from 'express';
import { updateController } from './controllers/contentControllers';
import { pingController } from './controllers/utilControllers';

export default (app: Application) => {
  app.get('/ping', pingController);
  app.post('/update', updateController);
};
