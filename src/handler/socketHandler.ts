import * as debug from 'debug';
import { Cache } from 'lru-cache';
import * as socketIo from 'socket.io';
import { APP_NAME } from '../config';
import service from '../index';
import KerckhoffContent from '../models/KerckhoffContent';
import { Events, SubscriberState } from '../models/States';
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
        const kc = item.associateContent();
        // TODO: keep this alive
        process.nextTick(() => {
          service.refreshSubscriber(id, item);
        });
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
  public associateContent(slug?: string): KerckhoffContent {
    if (this.content === undefined) {
      if (slug === undefined) {
        throw Error('cannot associate without a known slug!');
      }
      this.content = slug;
    }

    const kc = service.getOrSetContent(this.content!);
    return kc;
  }

  private setListeners() {
    this.socket.on(Events.INIT, this.handleINIT.bind(this));
    this.socket.on(Events.REFRESH, this.handleREFRESH.bind(this));
    this.socket.on('disconnect', msg => {
      this.debug(`disconnected: ${msg}`);
      this.state = SubscriberState.INVALID;
    });
    this.socket.on('reconnect', this.handleReconnect.bind(this));
  }

  private isInitRequest(arg: any): arg is InitRequest {
    return typeof arg.id === 'string';
  }

  private handleReconnect(arg: any) {
    this.debug(`received reconnect call: ${JSON.stringify(arg)}`);
    switch (this.state) {
      case SubscriberState.UNINITIALIZED:
      case SubscriberState.LISTENING: {
        // Ignore reconnect
        break;
      }
      case SubscriberState.INVALID: {
        if (this.content) {
          const kc = this.associateContent();
          kc.getData().then(data => {
            this.socket.emit(Events.UPDATE, data);
            this.socket.join(arg.id);
          });
        } // otherwise ignore
        break;
      }
    }
  }

  // TODO: handle every event, and handle every state
  private handleINIT(arg: any) {
    this.debug(`received init call: ${JSON.stringify(arg)}`);
    switch (this.state) {
      case SubscriberState.UNINITIALIZED: {
        if (this.isInitRequest(arg)) {
          const kc = this.associateContent(arg.id);
          this.socket.emit(Events.OK);
          kc
            .getData()
            .then(data => {
              this.socket.emit(Events.UPDATE, data);
              this.socket.join(arg.id, err => {
                if (err) {
                  this.state = SubscriberState.INVALID;
                  this.debug(
                    `error occurred when subscribing to ${
                      arg.id
                    }, ${JSON.stringify(err)}`
                  );
                } else {
                  this.debug(`successfully subscribed to ${arg.id}`);
                }
              });
            })
            .catch(err => {
              this.debug(`${JSON.stringify(err.request)}`);
            });
          this.state = SubscriberState.LISTENING;
        } else {
          this.socket.emit(Events.ERR, {
            msg: 'The initialization is invalid.',
          });
          this.state = SubscriberState.INVALID;
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
    this.debug(`received refesh call`);
    switch (this.state) {
      case SubscriberState.UNINITIALIZED:
      case SubscriberState.INVALID: {
        this.socket.emit(Events.ERR, {
          msg: "This socket can't be refreshed!",
        });
        break;
      }
      case SubscriberState.LISTENING: {
        const kc = this.associateContent();
        kc.getData().then(data => {
          this.socket.emit(Events.UPDATE, data);
          this.socket.join(this.content!);
        });
      }
    }
  }
}
