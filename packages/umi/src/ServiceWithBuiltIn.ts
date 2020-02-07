import { join } from 'path';
import { IServiceOpts, Service as CoreService } from '@umijs/core';

class Service extends CoreService {
  constructor(opts: IServiceOpts) {
    process.env.UMI_VERSION = require('../package').version;

    super({
      ...opts,
      presets: [
        require.resolve('@umijs/preset-built-in'),
        ...(opts.presets || []),
      ],
    });
  }
}

export { Service };
