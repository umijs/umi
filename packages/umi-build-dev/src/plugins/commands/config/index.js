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
    return api.config;
  }

  function get(key) {
    if (api.config[key]) {
      console.log(
        stringifyObject(api.config[key], {
          indent: '  ',
        }),
      );
      return api.config[key];
    }
  }

  function set(key, value, plugin) {
    return setConfig({
      key,
      value,
      file: service.userConfig.file || join(cwd, '.umirc.js'),
      plugin,
    });
  }

  function rm(key) {
    console.log('delete', key);
  }

  function configHandler(args) {
    switch (args._[0]) {
      case 'list':
        return list();
      case 'get':
        assert(args._[1], `key must supplied, e.g. umi config get routes`);
        return get(args._[1]);
      case 'set':
        assert(args._[1], `key, e.g. umi config set mountElementId root`);
        return set(args._[1], args._[2], args.plugin);
      case 'delete':
        assert(args._[1], `key must supplied, e.g. umi config delete externals`);
        return rm(args._[1]);
      default:
        throw new Error(
          `unsupported action ${args._[0]} for umi config, try list, get, set and delete`,
        );
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
