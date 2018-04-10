import * as debug from "debug";
import * as socketIo from "socket.io";
import {APP_NAME} from "../config";

enum Events {
  INIT = "init"
}

enum SubscriberState {
  UNINITIALIZED = "UI",
  LISTENING = "LI",
  INVALID = "IN"
}

export default class Subscriber {
  private connectionId: string;
  private socket: socketIo.Socket;
  private debug: debug.IDebugger;
  private state: SubscriberState;
  private content?: string;

  constructor(socket: socketIo.Socket) {
    this.state = SubscriberState.UNINITIALIZED;
    this.connectionId = socket.id;
    this.debug = debug(APP_NAME + "-socket-" + this.connectionId);
    this.socket = socket;
    this.setListeners();
  }

  private setListeners() {
    this.socket.on(Events.INIT, this.handleINIT);
  }

  private handleINIT(arg: any) {
    this.debug(`received init call: ${arg}`)
    switch(this.state) {
      case SubscriberState.UNINITIALIZED: {
        break;
      }
      case SubscriberState.LISTENING: {
        break;
      }
    }
    return
  }
}
