import { MFSU } from './index';

interface IOpts {
  mfsu: MFSU;
}

export class DepBuilder {
  public opts: IOpts;
  constructor(opts: IOpts) {
    this.opts = opts;
  }

  async build() {}

  async writeMFFiles() {}
}
