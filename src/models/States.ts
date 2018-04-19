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

export { Events, SubscriberState };
