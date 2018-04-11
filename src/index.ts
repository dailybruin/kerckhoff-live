import * as debug from 'debug';
import * as http from 'http';
import Service from './App';

const service = new Service();
service.listen();

export default service;
