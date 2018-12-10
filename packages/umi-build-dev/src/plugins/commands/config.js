import assert from 'assert';
import stringifyObject from 'stringify-object';
import setConfig from '../../utils/setConfig';

export default function(api) {
  const { service } = api;

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
    console.log('set', key, value);
    console.log('file', service.userConfig.file);
    setConfig({
      key,
      value,
      file: service.userConfig.file,
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
        assert(
          args._[1] && args._[2],
          `key and value must supplied, e.g. umi config set mountElementId root`,
        );
        set(args._[1], args._[2]);
        break;
      case 'delete':
        assert(
          args._[1],
          `key must supplied, e.g. umi config delete externals`,
        );
        rm(args._[1]);
        break;
      default:
        throw new Error(
          `unsupported action ${
            args._[0]
          } for umi config, try list, get, set and delete`,
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
