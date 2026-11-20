import {
  catchUnhandledRejection,
  checkLocal,
  checkVersion as checkNodeVersion,
  logger,
  printHelp,
  setNoDeprecation,
  setNodeTitle,
  yParser,
} from '@umijs/utils';
import { DEV_COMMAND, FRAMEWORK_NAME, MIN_NODE_VERSION } from '../constants';
import { Service } from '../service/service';
import { dev } from './dev';

interface IOpts {
  presets?: string[];
}

catchUnhandledRejection();

export async function run(opts?: IOpts) {
  checkNodeVersion(MIN_NODE_VERSION);
  const argv = process.argv.slice(2);

  const args = yParser(argv, {
    alias: {
      version: ['v'],
      help: ['h'],
    },
    boolean: ['version'],
    ...(argv[0] === 'build'
      ? {
          string: ['export'],
          coerce: {
            export(value: string | boolean | (string | boolean)[]) {
              const target = Array.isArray(value)
                ? value[value.length - 1]
                : value;
              if (target === 'false') return false;
              if (target === '' || target === 'true') return true;
              return target;
            },
          },
        }
      : {}),
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
  if (
    command === 'build' &&
    (args.export === true || typeof args.export === 'string') &&
    !args.help &&
    !args.version
  ) {
    const exporter: typeof import('./analyzeExport') = require('./analyzeExport');
    await exporter.analyzeBuildExport(
      { ...args, export: true },
      typeof args.export === 'string' ? args.export : undefined,
    );
    return;
  }

  checkLocal();
  setNodeTitle(FRAMEWORK_NAME);
  setNoDeprecation();

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
