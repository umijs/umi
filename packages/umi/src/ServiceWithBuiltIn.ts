import { IServiceOpts, Service as CoreService } from '@umijs/core';

class Service extends CoreService {
  constructor(opts: IServiceOpts) {
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
