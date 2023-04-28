import { logger, printHelp, setNoDeprecation, yParser } from '@umijs/utils';
import { DEV_COMMAND, FRAMEWORK_NAME } from '../constants';
import { Service } from '../service/service';
import { dev } from './dev';
import {
  catchUnhandledRejection,
  checkLocal,
  checkVersion as checkNodeVersion,
  setNodeTitle,
} from './node';

interface IOpts {
  presets?: string[];
}

catchUnhandledRejection();

export async function run(opts?: IOpts) {
  checkNodeVersion();
  checkLocal();
  setNodeTitle();
  setNoDeprecation();

  const args = yParser(process.argv.slice(2), {
    alias: {
      version: ['v'],
      help: ['h'],
    },
    boolean: ['version'],
  });
  const command = args._[0];
  const FEATURE_COMMANDS = ['mfsu', 'setup', 'deadcode'];
  if ([DEV_COMMAND, ...FEATURE_COMMANDS].includes(command)) {
    process.env.NODE_ENV = 'development';
  } else if (command === 'build') {
    process.env.NODE_ENV = 'production';
  }
  if (opts?.presets) {
    process.env[`${FRAMEWORK_NAME}_PRESETS`.toUpperCase()] =
      opts.presets.join(',');
  }
  if (command === DEV_COMMAND) {
    dev();
  } else {
    try {
      await new Service().run2({
        name: args._[0],
        args,
      });
    } catch (e: any) {
      logger.fatal(e);
      printHelp.exit();
      process.exit(1);
    }
  }
}
