import { Service as CoreService } from '@umijs/core';
import { dirname } from 'path';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from '../constants';
import { getCwd } from './cwd';

export class Service extends CoreService {
  constructor(opts?: any) {
    process.env.UMI_DIR = dirname(require.resolve('../../package'));
    super({
      ...opts,
      env: process.env.NODE_ENV,
      cwd: getCwd(),
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      frameworkName: FRAMEWORK_NAME,
      presets: [
        require.resolve('@umijs/preset-built-in'),
        ...(opts?.presets || []),
      ],
    });
  }

  async run2(opts: { name: string; args?: any }) {
    let name = opts.name;
    if (opts?.args.version || name === 'v') {
      name = 'version';
    } else if (opts?.args.help || !name || name === 'h') {
      name = 'help';
    }

    // TODO
    // initWebpack

    return await this.run({ ...opts, name });
  }
}
