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

  public json(data: any) {
    this._res.setHeader('Content-Type', 'application/json');
    this._res.end(JSON.stringify(data));
    return this;
  }
}

export default UmiApiResponse;
