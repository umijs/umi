import assert from 'assert';
import { statSync, existsSync } from 'fs';
import { join, relative, dirname, extname, basename } from 'path';
import rimraf from 'rimraf';

export default function(api) {
  const { paths, config, log } = api;

  function list() {
    console.log(config);
  }

  function configHandler(args) {
    switch (args._[0]) {
      case 'list':
        list();
        break;
      default:
        throw new Error(`unsupported action ${args._[0]} for umi config`);
    }
  }

  api.registerCommand(
    'config',
    {
      description: 'update config via cli',
      options: {},
    },
    configHandler,
  );
}
