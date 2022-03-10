import type { IncomingMessage } from 'http';
import type { IRoute } from '../../types';
import { matchApiRoute } from './utils';

class UmiApiRequest {
  private _req: IncomingMessage;
  private readonly _params: { [key: string]: string } = {};

  constructor(req: IncomingMessage, apiRoutes: IRoute[]) {
    this._req = req;
    const m = matchApiRoute(apiRoutes, this.pathName || '');
    if (m) this._params = m.params;
  }

  get params() {
    return this._params;
  }

  private _body: any = null;

  get body() {
    return this._body;
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

  get cookies() {
    return this._req.headers.cookie
      ?.split(';')
      .reduce((acc: { [key: string]: string }, cur) => {
        const [key, value] = cur.split('=');
        acc[key.trim()] = value;
        return acc;
      }, {});
  }

  get url() {
    return this._req.url;
  }

  get pathName() {
    return this._req.url?.split('?')[0];
  }

  public readBody() {
    if (this._req.headers['content-length'] === '0') {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      let body = '';
      this._req.on('data', (chunk) => {
        body += chunk;
      });
      this._req.on('end', () => {
        // TODO: handle other content types
        switch (this._req.headers['content-type']) {
          case 'application/json':
            try {
              this._body = JSON.parse(body);
            } catch (e) {
              this._body = body;
            }
            break;
          default:
            this._body = body;
            break;
        }
        resolve();
      });
      this._req.on('error', reject);
    });
  }
}

export default UmiApiRequest;
