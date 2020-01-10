import { IConfig, IRoute } from '..';

interface IOpts {
  config: IConfig;
}

class Html {
  config: IConfig;
  constructor(opts: IOpts) {
    this.config = opts.config;
  }

  getContent({ route }: { route: IRoute }) {}
}

export default Html;
