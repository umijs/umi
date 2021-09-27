import { Service as CoreService } from '@umijs/core';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from '../constants';
import { getCwd } from './cwd';

export class Service extends CoreService {
  constructor(opts?: any) {
    super({
      ...opts,
      cwd: getCwd(),
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      frameworkName: FRAMEWORK_NAME,
      presets: [
        require.resolve('@umijs/preset-built-in'),
        ...(opts?.presets || []),
      ],
    });
  }

  run2(opts: { name: string; args?: any }) {
    if (opts.name === 'dev') {
      process.env.NODE_ENV = 'development';
    } else if (opts.name === 'build') {
      process.env.NODE_ENV = 'production';
    }

    let name = opts.name;
    if (opts?.args.version || name === 'v') {
      name = 'version';
    } else if (opts?.args.help || !name || name === 'h') {
      name = 'help';
    }

    // TODO
    // initWebpack

    this.run({ ...opts, name });
  }
}
