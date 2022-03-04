import type { IncomingMessage } from 'http';

class UmiApiRequest {
  private _req: IncomingMessage;

  constructor(req: IncomingMessage) {
    this._req = req;
  }

  get headers() {
    return this._req.headers;
  }

  get method() {
    return this._req.method;
  }

  get query() {
    return (
      this._req.url
        ?.split('?')[1]
        ?.split('&')
        .reduce((acc: { [key: string]: string | string[] }, cur) => {
          const [key, value] = cur.split('=');
          const k = acc[key];
          if (k) {
            if (k instanceof Array) {
              k.push(value);
            } else {
              acc[key] = [k, value];
            }
          } else {
            acc[key] = value;
          }
          return acc;
        }, {}) || {}
    );
  }

  get body() {
    throw new Error('Not implemented');
  }

  get cookies() {
    throw new Error('Not implemented');
  }

  get url() {
    return this._req.url;
  }

  get pathName() {
    return this._req.url?.split('?')[0];
  }
}

export default UmiApiRequest;
