import * as debug from "debug";
import { Cache } from "lru-cache";
import * as socketIo from "socket.io";
import { APP_NAME } from "../config";
import KerckhoffContent from "../models/KerckhoffContent";

enum Events {
  INIT = "init"
}

enum SubscriberState {
  UNINITIALIZED = "UI",
  LISTENING = "LI",
  INVALID = "IN"
}

export default class Subscriber {

  public static cleanUp(id: string, item: Subscriber) : void {
    switch(item.state) {
      case SubscriberState.INVALID:
      case SubscriberState.UNINITIALIZED: {
        item.closeSocket("timed out/cache eviction")
        break;
      }
      case SubscriberState.LISTENING: {
        // TODO: keep this alive
        break;
      }
    }
  }

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

  public closeSocket(reason?: string) {
    const removedSock = this.socket.disconnect(true)
    this.debug(`closing socket: ${reason}`)
  }

  private setListeners() {
    this.socket.on(Events.INIT, this.handleINIT);
  }

  // TODO: handle every event, and handle every state

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
