import * as index from '../src/index';
import { updateController } from '../src/controllers/contentControllers';
import { Request, Response } from 'express';

test('server should be initialized', () => {
  expect(index).toBeTruthy();
});

test('server handles POST from django', () => {
  let resCode = 400;

  const req = {
    body: {
      id: 'bla',
    },
  } as Request;

  const res = {
    sendStatus: (arg: number) => {
      resCode = arg;
    },
  } as Response;

  updateController(req, res);

  expect(resCode).toBe(200);
  expect(index.default.getContentById('bla')).toBeTruthy();
});
