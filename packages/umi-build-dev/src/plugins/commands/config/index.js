import assert from 'assert';
import stringifyObject from 'stringify-object';
import { join } from 'path';
import setConfig from './setConfig';

export default function(api) {
  const { service, cwd } = api;

  function list() {
    console.log(
      stringifyObject(api.config, {
        indent: '  ',
      }),
    );
  }

  function get(key) {
    if (api.config[key]) {
      console.log(
        stringifyObject(api.config[key], {
          indent: '  ',
        }),
      );
    }
  }

  function set(key, value) {
    setConfig({
      key,
      value,
      file: service.userConfig.file || join(cwd, '.umirc.js'),
    });
  }

  function rm(key) {
    console.log('delete', key);
  }

  function configHandler(args) {
    switch (args._[0]) {
      case 'list':
        list();
        break;
      case 'get':
        assert(args._[1], `key must supplied, e.g. umi config get routes`);
        get(args._[1]);
        break;
      case 'set':
        assert(args._[1], `key, e.g. umi config set mountElementId root`);
        set(args._[1], args._[2]);
        break;
      case 'delete':
        assert(args._[1], `key must supplied, e.g. umi config delete externals`);
        rm(args._[1]);
        break;
      default:
        throw new Error(
          `unsupported action ${args._[0]} for umi config, try list, get, set and delete`,
        );
    }
  }

  api.registerCommand(
    'config',
    {
      description: '[alpha] update config via cli',
      options: {},
    },
    configHandler,
  );
}
