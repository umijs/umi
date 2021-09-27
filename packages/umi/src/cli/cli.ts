import { logger, yParser } from '@umijs/utils';
import { DEV_COMMAND } from '../constants';
import { Service } from '../service/service';
import { dev } from './dev';
import {
  checkLocal,
  checkVersion as checkNodeVersion,
  setNodeTitle,
} from './node';

checkNodeVersion();
checkLocal();
setNodeTitle();

(async () => {
  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ['v'],
      help: ['h'],
    },
    boolean: ['version'],
  });
  if (args._[0] === DEV_COMMAND) {
    dev();
  } else {
    try {
      await new Service().run2({
        name: args._[0],
        args,
      });
    } catch (e: any) {
      logger.error(e.message);
      process.exit(1);
    }
  }
})();
