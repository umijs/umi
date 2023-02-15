import { fsExtra } from '@umijs/utils';
import { IApi } from '../../types';

import { join } from 'path';

const HELP_TEXT = `
# MFSU CLI util
# umi mfsu [action]

# Show Help
$ umi mfsu 

# Manually build mfsu dependencies
$ umi mfsu build 
$ umi mfsu b 

# Reset mfsu Cache
$ umi mfsu reset 
$ umi mfsu reset --hard   

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

      const util: MFSUUtilBase =
        api.config.mfsu?.strategy === 'eager'
          ? new MFSUUtilEager(api)
          : new MFSUUtilEager(api);

      switch (command) {
        case 'list':
        case 'ls':
          break;
        case 'remove':
          // remove(api.appData.mainConfigFile, name);
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

abstract class MFSUUtilBase {
  protected mfsuCacheBase: string;
  constructor(readonly api: IApi) {
    const cacheBase =
      api.config.cacheDirectoryPath || join(api.cwd, 'node_modules/.cache');

    this.mfsuCacheBase =
      api.config?.mfsu?.cacheDirectoryPath || join(cacheBase, 'mfsu');
  }

  abstract jsonFilePath(): string;
  abstract getCacheJSON(): string;

  abstract build(): Promise<void>;
  removeCacheJSON() {
    return fsExtra.removeSync(this.jsonFilePath());
  }

  clearAllCache() {}
}

class MFSUUtilEager extends MFSUUtilBase {
  jsonFilePath(): string {
    return join(this.mfsuCacheBase, 'MFSU_CACHE_v4.json');
  }
  getCacheJSON(): any {
    const jsonFile = join(this.mfsuCacheBase, 'MFSU_CACHE_v4.json');
    if (fs.existsSync(jsonFile)) {
      return require(jsonFile);
    } else {
      this.api.logger.error(
        'MFSU_CACHE_v4.json not found, please run `umi mfsu build` first',
      );
    }
  }
  async build() {
    return;
  }
}
