import * as debug from 'debug';
import * as http from 'http';
import App from './App';

const server = new App().listen;

export default server;
