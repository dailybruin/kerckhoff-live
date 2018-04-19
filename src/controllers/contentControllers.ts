import axios from 'axios';
import { Request, Response } from 'express';
import service from '../index';
import KerckhoffContent from '../models/KerckhoffContent';
import { IPostRequest } from '../models/PostRequest';

/*
TODO: this function handles an incoming content updated
POST request from the main Kerckhoff server
It'll need to either
a) create a new KerckhoffContent and add it to the cache if it does not exist
b) call the update method on the KerckhoffContent if it does
*/
export function updateController(req: Request, res: Response) {
  // if (!req.body.id) {

  // }
  const reqBody = req.body as IPostRequest;
  const kerckhoffContent = service.getOrSetContent(reqBody.id);

  service.debug(`received update POST`);

  kerckhoffContent.pushData(true);
  res.sendStatus(200);
  return;
}
