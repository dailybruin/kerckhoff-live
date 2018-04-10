import * as debug from "debug";
import * as express from "express"
import { createServer, Server } from "http";
import * as socketIo from "socket.io";
import {APP_NAME, HOST, PORT} from './config';
import Subscriber from "./handler/socketHandler";

class App {
  private app: express.Application;
  private server: Server;
  private sio: socketIo.Server;
  private debug: debug.IDebugger

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.sio = socketIo(this.server);
    this.debug = debug(APP_NAME + "-http");
  }

  public listen() {
    this.server.listen(PORT, HOST, () => {
      this.debug(`listening on ${HOST}:${PORT}`)
    })

    this.sio.on('connect', Subscriber)
    return this.server;
  }
}

export default App;
