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
<<<<<<< HEAD
  // if (!req.body.id) {

  // }
  const reqBody = req.body as IPostRequest;
  const kerckhoffContent = service.getContentById(reqBody.id);

  if (kerckhoffContent !== undefined) {
    kerckhoffContent.pushData(true);
  } else {
    service.setContentId(reqBody.id);
  }
  res.sendStatus(200);
=======
  /*slug = req.params.id;
  if(if KerckhoffContent does not exists) {
  //Create KerckhoffContent
  //Add it to the cache
  }
  else {
  //Call update method on KerckhoffContent
  }*/
>>>>>>> 5ecc342736352b60c0d7139cbe987ea9fbcfb34a
  return;
}
