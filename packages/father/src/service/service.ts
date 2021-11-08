import { Service as CoreService } from '@umijs/core';
import * as process from 'process';
import { DEFAULT_CONFIG_FILES, FRAMEWORK_NAME } from '../constants';

export class Service extends CoreService {
  constructor(opts?: any) {
    const cwd = process.cwd();
    super({
      ...opts,
      env: process.env.NODE_ENV,
      cwd,
      defaultConfigFiles: DEFAULT_CONFIG_FILES,
      frameworkName: FRAMEWORK_NAME,
      presets: [require.resolve('../preset')],
    });
  }

  async run2(opts: { name: string; args?: any }) {
    let name = opts.name;
    if (opts?.args.version || name === 'v') {
      name = 'version';
    } else if (opts?.args.help || !name || name === 'h') {
      name = 'help';
    }

    return await this.run({ ...opts, name });
  }
}
