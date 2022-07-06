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
        switch (this._req.headers['content-type']?.split(';')[0]) {
          case 'application/json':
            try {
              this._body = JSON.parse(body);
            } catch (e) {
              this._body = body;
            }
            break;
          case 'multipart/form-data':
            const boundary =
              this.headers['content-type']?.split('boundary=')[1];
            if (!boundary) {
              this._body = body;
              break;
            }
            this._body = parseMultipart(body, boundary);
            break;
          case 'application/x-www-form-urlencoded':
            this._body = parseUrlEncoded(body);
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

export function parseMultipart(body: string, boundary: string) {
  return body
    .split(`--${boundary}`)
    .reduce((acc: { [key: string]: any }, cur: string) => {
      const [meta, value] = cur.split('\r\n\r\n');
      const name = meta?.split('name="')[1]?.split('"')[0];
      const filename = meta?.split('filename="')[1]?.split('"')[0];
      if (!name) return acc;

      // if there is filename, this field is file, save as buffer
      if (filename) {
        acc[name] = {
          filename,
          data: Buffer.from(value, 'binary'),
        };
        return acc;
      }

      // if there is no filename, this field is string, save as string
      acc[name] = value?.replace(/\r\n$/, '');
      return acc;
    }, {});
}

export function parseUrlEncoded(body: string) {
  return body.split('&').reduce((acc: { [key: string]: any }, cur: string) => {
    const [key, value] = cur.split('=');
    acc[key] = decodeURI(value);
    return acc;
  }, {});
}

export default UmiApiRequest;
