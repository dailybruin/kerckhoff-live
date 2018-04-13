import { Request, Response } from 'express';
import Service from '../app';

/*
TODO: this function handles an incoming content updated
POST request from the main Kerckhoff server
It'll need to either
a) create a new KerckhoffContent and add it to the cache if it does not exist
b) call the update method on the KerckhoffContent if it does
*/
export function updateController(req: Request, res: Response) {
  /*slug = req.params.id;
  if(if KerckhoffContent does not exists) {
  //Create KerckhoffContent
  //Add it to the cache
  }
  else {
  //Call update method on KerckhoffContent
  }*/
  return;
}
