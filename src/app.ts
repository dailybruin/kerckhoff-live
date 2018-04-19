import * as bodyparser from 'body-parser';
import * as debug from 'debug';
import * as express from 'express';
import { createServer, Server } from 'http';
import * as _ from 'lodash';
import * as LRU from 'lru-cache';
import * as socketIo from 'socket.io';
import { APP_NAME, HOST, PORT } from './config';
import Subscriber from './handler/socketHandler';
import KerckhoffContent from './models/KerckhoffContent';
import bindRoutes from './routes';

class Service {
  /*
    Just gonna use a public static variable. Sue me.

    This global is meant to keep track of data this particular
    server instance has knowledge of. We currently assume the unclustered usage
    of this server (i.e. only one instance of this server), but should
    load somehow become an issue we might need to figure out supporting scaling.

    See https://socket.io/docs/using-multiple-nodes/
  */
  public debug: debug.IDebugger;

  private localData: LRU.Cache<string, KerckhoffContent>;
  private connected: LRU.Cache<string, Subscriber>;
  private app: express.Application;
  private server: Server;
  private sio: socketIo.Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.sio = socketIo(this.server);
    this.sio.origins('*:*');
    this.debug = debug(APP_NAME + '-http');
    this.connected = new LRU({
      dispose: Subscriber.cleanUp,
      max: 100000,
      maxAge: 30000, // 3 minutes
    });
    this.localData = new LRU({
      max: 1000,
      maxAge: 60000, // 1 minute
    });
    this.setupMiddleware();
    bindRoutes(this.app);
  }

  public listen() {
    this.server.listen(PORT, HOST, () => {
      this.debug(`listening on ${HOST}:${PORT}`);
    });

    this.sio.on('connect', socket => {
      this.connected.set(socket.id, new Subscriber(socket));
    });
    return this.server;
  }

  public getSocketServer(): socketIo.Server {
    return this.sio;
  }

  public getOrSetContent(id: string): KerckhoffContent {
    const kc = this.getContentById(id);
    if (kc) {
      return kc;
    } else {
      return this.setContentById(id);
    }
  }

  // Get KerckchoffContent object from LRUCache using id slug
  public getContentById(id: string): KerckhoffContent | undefined {
    const data = this.getLocalData();
    return data.get(id);
  }

  // Creates new LRUCache object using id
  public setContentById(id: string): KerckhoffContent {
    const data = this.getLocalData();
    const newKerckhoffContent = new KerckhoffContent(id);
    data.set(id, newKerckhoffContent);
    return newKerckhoffContent;
  }

  public refreshSubscriber(id: string, sub: Subscriber): void {
    this.connected.set(id, sub);
  }

  private setupMiddleware() {
    this.app.use(bodyparser.json());
  }

  // Just to make our lives easier in unit testing
  private getLocalData(): LRU.Cache<string, KerckhoffContent> {
    return this.localData;
  }
}

export default Service;
