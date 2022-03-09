import type { ServerResponse } from 'http';

class UmiApiResponse {
  private _res: ServerResponse;

  constructor(res: ServerResponse) {
    this._res = res;
  }

  public status(statusCode: number) {
    this._res.statusCode = statusCode;
    return this;
  }

  public header(key: string, value: string) {
    this._res.setHeader(key, value);
    return this;
  }

  public setCookie(key: string, value: string) {
    this._res.setHeader('Set-Cookie', `${key}=${value}; path=/`);
    return this;
  }

  public text(data: string) {
    this._res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    this._res.end(data);
    return this;
  }

  public html(data: string) {
    this._res.setHeader('Content-Type', 'text/html; charset=utf-8');
    this._res.end(data);
    return this;
  }

  public json(data: any) {
    this._res.setHeader('Content-Type', 'application/json');
    this._res.end(JSON.stringify(data));
    return this;
  }
}

export default UmiApiResponse;
