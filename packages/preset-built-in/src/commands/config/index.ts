import { IApi } from '../../types';
import list from './list';
import remove from './remove';
import set from './set';

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
    fn({ args }) {
      const { _ } = args;
      const [command, name, value] = _;
      switch (command) {
        case 'list':
          list(api.config, args.name || '');
          break;
        case 'get':
          list(api.config, name);
          break;
        case 'set':
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
