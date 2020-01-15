import { Service as CoreService, IServiceOpts } from '@umijs/core';

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
