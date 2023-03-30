interface UIScoket extends WebSocket {
  listen: (callback: Subscription<SocketAction>) => any;
  send: (action: any) => void;
}
let socket: UIScoket;

type Subscription<T> = (val: T) => void;

class EventEmitter<T> {
  private subscriptions = new Set<Subscription<T>>();

  emit = (val: T) => {
    for (const subscription of this.subscriptions) {
      subscription(val);
    }
  };

  useSubscription = (callback: Subscription<T>) => {
    function subscription(val: T) {
      if (callback) {
        callback(val);
      }
    }
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  };
}
interface SocketAction {
  type: string;
  payload?: any;
  send?: any;
}

const socketEmitter = new EventEmitter<SocketAction>();

function getSocketHost() {
  const url: any = location;
  const host = url.host;
  const isHttps = url.protocol === 'https:';
  const key = Math.random().toString(36).slice(5);
  return `${isHttps ? 'wss' : 'ws'}://${host}?who=UI${key}`;
}

const messageQueue = new Set();
let isOpen = false;

export function createSocket() {
  // 连接中，直接返回
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }
  const _socket = new WebSocket(getSocketHost(), 'webpack-hmr') as UIScoket;
  function send(action: any) {
    let message = action;
    if (typeof action !== 'string') {
      message = JSON.stringify(action);
    }
    if (isOpen) {
      _socket.send(message);
    } else {
      messageQueue.add(message);
    }
  }
  let pingTimer: NodeJS.Timer;

  _socket.listen = (callback: Subscription<SocketAction>) => {
    return socketEmitter.useSubscription(callback);
  };

  _socket.onopen = () => {
    isOpen = true;
    // 发送队列中的消息
    for (const message of messageQueue) {
      _socket.send(message);
      messageQueue.delete(message);
    }
  };

  _socket.onmessage = async (message) => {
    let { data } = message;
    data = JSON.parse(data);
    switch (data.type) {
      case 'connected':
        console.log(`[UI] connected.`);
        // 心跳包
        pingTimer = setInterval(() => send('ping'), 30000);
        break;
      case 'reload':
        window.location.reload();
        break;
      case 'pong':
        console.log(`[UI] I am live.`);
        break;
      default:
        socketEmitter.emit({
          send,
          ...data,
        });
        break;
    }
  };
  _socket.onclose = async () => {
    isOpen = false;
    if (pingTimer) clearInterval(pingTimer);
    console.info('[UI] Dev server disconnected. Polling for restart...');
    // webpack-hmr 会尝试重连，这里可以忽略
  };

  socket = { ..._socket, send }
  return socket;
}

export { socket };
