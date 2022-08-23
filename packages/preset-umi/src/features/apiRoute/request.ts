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
      let body: any[] = [];
      this._req.on('data', (chunk) => {
        body.push(chunk);
      });
      this._req.on('end', () => {
        const bodyBuffer = Buffer.concat(body);
        switch (this._req.headers['content-type']?.split(';')[0]) {
          case 'application/json':
            try {
              this._body = JSON.parse(bodyBuffer.toString());
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
            this._body = parseMultipart(bodyBuffer, boundary);
            break;
          case 'application/x-www-form-urlencoded':
            this._body = parseUrlEncoded(bodyBuffer.toString());
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

export function parseMultipart(body: Buffer, boundary: string) {
  const hexBoundary = Buffer.from(`--${boundary}`, 'utf-8').toString('hex');
  return body
    .toString('hex')
    .split(hexBoundary)
    .reduce((acc: { [key: string]: any }, cur: string) => {
      const [hexMeta, hexValue] = cur.split(
        Buffer.from('\r\n\r\n').toString('hex'),
      );
      const meta = Buffer.from(hexMeta, 'hex').toString('utf-8');
      const name = meta.split('name="')[1]?.split('"')[0];

      // if this part doesn't have name, skip it
      if (!name) return acc;

      // if there is filename, this field is file, save as buffer
      const fileName = meta.split('filename="')[1]?.split('"')[0];
      if (fileName) {
        const fileBufferBeforeTrim = Buffer.from(hexValue, 'hex');
        const fileBuffer = fileBufferBeforeTrim.slice(
          0,
          fileBufferBeforeTrim.byteLength - 2,
        );
        const contentType = meta.split('Content-Type: ')[1];
        acc[name] = {
          fileName,
          data: fileBuffer,
          contentType,
        };
        return acc;
      }

      // if there is no filename, this field is string, save as string
      const valueBufferBeforeTrim = Buffer.from(hexValue, 'hex');
      const valueBuffer = valueBufferBeforeTrim.slice(
        0,
        valueBufferBeforeTrim.byteLength - 2,
      );
      acc[name] = valueBuffer.toString('utf-8');
      return acc;
    }, {});
}

export function parseUrlEncoded(body: string) {
  return body.split('&').reduce((acc: { [key: string]: any }, cur: string) => {
    const [key, value] = cur.split('=');
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

export default UmiApiRequest;
