import { IApi } from '../../types';
import { EagerUtil, MFSUUtilBase, NormalUtil } from './util';

const HELP_TEXT = `
# MFSU CLI util
# umi mfsu [action]

# Show Help
$ umi mfsu 

# Manually build mfsu dependencies
$ umi mfsu build 
$ umi mfsu b 

# list mfsu dependencies
$ umi mfsu list 
$ umi mfsu ls 
`.trim();

export default (api: IApi) => {
  api.describe({
    key: 'mfsu-cli',
  });
  api.registerCommand({
    name: 'mfsu',
    description: 'umi mfsu CLI util',
    details: HELP_TEXT,
    configResolveMode: 'strict',
    async fn({ args }) {
      const { _ } = args;
      const [command = 'help'] = _;

      if (api.config.mfsu === false) {
        api.logger.info('MFSU is not enabled');
        return;
      }

      const util: MFSUUtilBase =
        api.config.mfsu?.strategy === 'eager'
          ? new EagerUtil(api)
          : new NormalUtil(api);

      switch (command) {
        case 'build':
        case 'b':
          try {
            const { force } = args;
            util.removeCacheJSON();
            await util.build(force);
            process.exit(0);
          } catch (e) {
            process.exit(-1);
          }
          break;
        case 'list':
        case 'ls':
        case 'l':
          break;
        case 'remove':
          const { all } = args;
          if (all) {
            util.clearAllCache();
          } else {
            util.removeCacheJSON();
          }
          break;
        case 'help':
          printHelpInfo();
          break;
        default:
          throw new Error(`Unsupported mfsu action`);
      }
    },
  });
};

function printHelpInfo() {
  console.log(HELP_TEXT);
}
