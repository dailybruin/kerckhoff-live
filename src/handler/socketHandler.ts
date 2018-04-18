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
  UPDATE = 'upd',
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
    this.socket.emit(Events.UPDATE, {
      content: {
        category: 'music',
        image: 'https://placeimg.com/1024/768/nature',
        text: `Sed at blandit diam. Cras accumsan in ligula sit amet malesuada. Praesent nec odio dapibus, auctor erat ac,
        facilisis risus. In hac habitasse platea dictumst. Etiam sit amet tristique elit,
        sit amet maximus sem. Praesent pharetra safddsf nibh eu tincidunt. Sed dapibus tempus luctus.
        Proin sit amet diam cursus, eleifend sapien eu, viverra sem`,
        time: '9:00',
        title: 'hello world',
      },
    });
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
        this.socket.emit(Events.OK, {});
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
