import { Terminal, IDisposable, ITerminalAddon } from 'xterm';

interface IAttachOptions {
  bidirectional?: boolean;
}

export class AttachAddon implements ITerminalAddon {
  private _socket: WebSocket;
  private _bidirectional: boolean;
  private _disposables: IDisposable[] = [];

  constructor(socket: WebSocket, options?: IAttachOptions) {
    this._socket = socket;
    // always set binary type to arraybuffer, we do not handle blobs
    this._socket.binaryType = 'arraybuffer';
    this._bidirectional = !(options && options.bidirectional === false);
  }

  public activate(terminal: Terminal): void {
    this._disposables.push(
      addSocketListener(this._socket, 'message', ev => {
        const { data } = ev as { data: ArrayBuffer | string };
        terminal.write(typeof data === 'string' ? data : new Uint8Array(data));
      }),
    );

    if (this._bidirectional) {
      this._disposables.push(terminal.onData(data => this._sendData(data)));
    }

    this._disposables.push(addSocketListener(this._socket, 'close', () => this.dispose()));
    this._disposables.push(addSocketListener(this._socket, 'error', () => this.dispose()));
  }

  public dispose(): void {
    this._disposables.forEach(d => d.dispose());
  }

  private _sendData(data: string): void {
    // TODO: do something better than just swallowing
    // the data if the socket is not in a working condition
    if (this._socket.readyState !== 1) {
      return;
    }
    this._socket.send(data);
  }
}

function addSocketListener<K extends keyof WebSocketEventMap>(
  socket: WebSocket,
  type: K,
  handler: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
): IDisposable {
  socket.addEventListener(type, handler);
  return {
    dispose: () => {
      if (!handler) {
        // Already disposed
        return;
      }
      socket.removeEventListener(type, handler);
    },
  };
}
