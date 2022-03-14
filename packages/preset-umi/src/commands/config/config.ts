import { IApi } from '../../types';
import { list } from './list';
import { remove } from './remove';
import { set } from './set';
import { writeFileSync } from 'fs';
import { join } from 'path';

export default (api: IApi) => {
  api.registerCommand({
    name: 'config',
    description: 'umi config cli',
    details: `
# umi configs
$ umi config [type] [name] [value]

# List configs
$ umi config list

# Get the specific config
$ umi config list --name history
$ umi config get history

# Set the specific config (only local config) [beta]
$ umi config set history "{type:'hash'}"

# Remove the specific config (only local config) [beta]
$ umi config remove history
$ umi config r history
    `.trim(),
    async fn({ args }) {
      const { _, all = false } = args;
      const [command, name, value] = _;
      switch (command) {
        case 'list':
          list(all ? api.config : api.userConfig, args.name || '');
          break;
        case 'get':
          list(api.config, name);
          break;
        case 'set':
          if (!api.appData.mainConfigFile) {
            const absPath = join(api.cwd, '.umirc.ts');
            const content = `export default {};`;
            writeFileSync(absPath, content, 'utf-8');

            api.appData.mainConfigFile = absPath;
          }
          set(api.appData.mainConfigFile, name, value);
          break;
        case 'remove':
        case 'r':
          remove(api.appData.mainConfigFile, name);
          break;
        default:
          throw new Error(`Unsupported sub command ${command} for umi config.`);
      }
    },
  });
};
