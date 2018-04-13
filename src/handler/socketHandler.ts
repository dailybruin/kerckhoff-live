import * as debug from 'debug';
import { Cache } from 'lru-cache';
import * as socketIo from 'socket.io';
import { APP_NAME } from '../config';
import KerckhoffContent from '../models/KerckhoffContent';

enum Events {
  INIT = 'init',
  OK = 'ack',
  ERR = 'err',
  REFRESH = 'ref',
}

enum SubscriberState {
  UNINITIALIZED = 'UI',
  LISTENING = 'LI',
  INVALID = 'IN',
}

interface InitRequest {
  id: string;
}

export default class Subscriber {
  public static cleanUp(id: string, item: Subscriber): void {
    switch (item.state) {
      case SubscriberState.INVALID:
      case SubscriberState.UNINITIALIZED: {
        item.closeSocket('timed out/cache eviction');
        break;
      }
      case SubscriberState.LISTENING: {
        // TODO: keep this alive
        item.associateContent();
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
    this.debug = debug(APP_NAME + '-socket-' + this.connectionId);
    this.socket = socket;
    this.setListeners();
    this.debug('new connection');
  }

  public closeSocket(reason?: string) {
    const removedSock = this.socket.disconnect(true);
    this.debug(`closing socket: ${reason}`);
  }

  // TODO: tries to either get an existing KerckhoffContent from the cache or create one (make a method!)
  // and calls its pushData method
  public associateContent(slug?: string): void {
    return;
  }

  private setListeners() {
    this.socket.on(Events.INIT, this.handleINIT.bind(this));
    this.socket.on(Events.REFRESH, this.handleINIT.bind(this));
  }

  private isInitRequest(arg: any): arg is InitRequest {
    return typeof arg.id === 'string';
  }

  // TODO: handle every event, and handle every state
  private handleINIT(arg: any) {
    this.debug(`received init call: ${JSON.stringify(arg)}`);
    switch (this.state) {
      case SubscriberState.UNINITIALIZED: {
        if (this.isInitRequest(arg)) {
          this.associateContent(arg.id);
        }
        break;
      }
      case SubscriberState.LISTENING: {
        this.socket.emit(Events.ERR, {
          msg: 'This socket has already been initialized.',
        });
        break;
      }
      case SubscriberState.INVALID: {
        this.socket.emit(Events.ERR, {
          msg: 'This socket is in an invalid state.',
        });
        break;
      }
    }
    return;
  }

  private handleREFRESH(arg: any) {
    switch (this.state) {
      case SubscriberState.UNINITIALIZED:
      case SubscriberState.INVALID: {
        this.socket.emit(Events.ERR, {
          msg: "This socket can't be refreshed!",
        });
        break;
      }
      case SubscriberState.LISTENING: {
        this.associateContent();
      }
    }
  }
}
