import { join } from 'path';
import Service from './Service';

process.env.UMI_TEST = true;
const fixtures = join(__dirname, 'fixtures/Service');

describe('Service', () => {
  it('resolve plugins from file system', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins'),
    });
    service.plugins = service.plugins.filter(p => p.id.indexOf('user:') === 0);

    // resolve plugins
    expect(service.plugins.map(p => p.id)).toEqual(['user:a.js', 'user:b.js']);
  });

  it('resolve plugins from file system failed', () => {
    expect(() => {
      new Service({
        cwd: join(fixtures, 'plugins-resolve-failed'),
      });
    }).toThrow(/Plugin \.\/a can't be resolved/);
  });

  it('init plugins', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    let appliedCount = 0;
    service.plugins = [
      {
        id: 'user:a',
        apply: () => {
          appliedCount += 1;
        },
      },
      {
        id: 'user:b',
        apply: () => {
          appliedCount += 1;
        },
      },
    ];
    service.initPlugins();
    expect(appliedCount).toEqual(2);
  });

  it('init plugins with onOptionChange', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    const RETURN_VAL = 'return val';
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.onOptionChange(() => RETURN_VAL);
        },
      },
    ];
    service.initPlugins();
    expect(service.plugins[0].onOptionChange()).toEqual(RETURN_VAL);
  });

  it('init plugins with onOptionChange (should be function)', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.onOptionChange(1);
        },
      },
    ];
    expect(() => {
      service.initPlugins();
    }).toThrow(
      /The first argument for api.onOptionChange should be function in/,
    );
  });

  it('applyPlugins and register', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.register('addFoo', ({ memo, args }) => {
            return `${memo}_${args}_1`;
          });
          api.register('addFoo', ({ memo, args }) => {
            return `${memo}_${args}_2`;
          });
        },
      },
    ];
    service.initPlugins();
    const val = service.applyPlugins('addFoo', {
      initialValue: 'a',
      args: 'b',
    });
    expect(val).toEqual('a_b_1_b_2');
  });

  it('applyPluginsAsync', done => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.register('modifyFooAsync', ({ memo, args }) => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(`${memo}_${args}_1`);
              }, 300);
            });
          });
          api.register('modifyFooAsync', ({ memo, args }) => {
            return new Promise(resolve => {
              setTimeout(() => {
                resolve(`${memo}_${args}_2`);
              }, 300);
            });
          });
        },
      },
    ];
    service.initPlugins();
    service
      ._applyPluginsAsync('modifyFooAsync', {
        initialValue: 'a',
        args: 'b',
      })
      .then(data => {
        expect(data).toEqual('a_b_1_b_2');
        done();
      });
  });

  it('registerMethod with API_TYPE.ADD', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerMethod('addFoo', {
            type: api.API_TYPE.ADD,
          });
          api.addFoo(1);
          api.addFoo(() => 2);
        },
      },
    ];
    service.initPlugins();
    const val = service.applyPlugins('addFoo');
    expect(val).toEqual([1, 2]);
  });

  it('registerMethod with API_TYPE.ADD in different plugins', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerMethod('addFoo', {
            type: api.API_TYPE.ADD,
          });
        },
      },
      {
        id: 'user:b',
        apply: api => {
          api.addFoo(1);
          api.addFoo(() => 2);
        },
      },
    ];
    service.initPlugins();
    const val = service.applyPlugins('addFoo');
    expect(val).toEqual([1, 2]);
  });

  it('registerMethod with API_TYPE.MODIFY', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerMethod('modifyFoo', {
            type: api.API_TYPE.MODIFY,
          });
          api.modifyFoo(memo => ({ ...memo, a: 'b' }));
          api.modifyFoo(memo => ({ ...memo, c: 'd' }));
        },
      },
    ];
    service.initPlugins();
    const val = service.applyPlugins('modifyFoo', {
      initialValue: { d: 1 },
    });
    expect(val).toEqual({ d: 1, a: 'b', c: 'd' });
  });

  it('registerMethod with API_TYPE.EVENT', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    let count = 0;
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerMethod('onFoo', {
            type: api.API_TYPE.EVENT,
          });
          api.onFoo(args => {
            count += args;
          });
          api.onFoo(args => {
            count += args;
          });
        },
      },
    ];
    service.initPlugins();
    service.applyPlugins('onFoo', {
      args: 1,
    });
    expect(count).toEqual(2);
  });

  it('registerMethod with apply method', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerMethod('customFoo', {
            apply({ memo, args }, ...userArgs) {
              return (
                memo +
                args +
                1 +
                (typeof userArgs[0] === 'function'
                  ? userArgs[0]({ memo, args })
                  : userArgs[0])
              );
            },
          });
          api.customFoo('22');
          api.customFoo(({ memo }) => `${memo}33`);
        },
      },
    ];
    service.initPlugins();
    const val = service.applyPlugins('customFoo', {
      initialValue: 'initialValue',
      args: '_args_',
    });
    expect(val).toEqual('initialValue_args_122_args_1initialValue_args_12233');
  });

  it('throw error if api.xxx is not defined', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.addFoo(1);
        },
      },
    ];
    expect(() => {
      service.initPlugins();
    }).toThrow(/api\.addFoo is not a function/);
  });

  it('throw error if api method exists', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerMethod('addFoo', {
            type: api.API_TYPE.ADD,
          });
          api.registerMethod('addFoo', {
            type: api.API_TYPE.ADD,
          });
        },
      },
    ];
    expect(() => {
      service.initPlugins();
    }).toThrow(/api\.addFoo exists/);
  });

  it('changePluginOption', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    let newOption = null;
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.onOptionChange((...args) => {
            newOption = args[0];
          });
        },
      },
    ];
    service.initPlugins();
    expect(service.plugins[0].opts).toEqual(undefined);
    service.plugins[0]._api.changePluginOption('user:a', {
      a: 'b',
    });
    expect(newOption).toEqual({ a: 'b' });
    expect(service.plugins[0].opts).toEqual({ a: 'b' });
  });

  it('registerPlugin', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerPlugin({
            id: 'a',
            apply(api) {
              api.registerPlugin({
                id: 'b',
                apply() {},
              });
            },
          });
        },
      },
    ];
    service.initPlugins();
    expect(service.plugins.map(p => p.id)).toEqual(['user:a', 'a', 'b']);
  });

  it('registerPlugin failed without id or apply', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerPlugin({
            id: 'a',
          });
        },
      },
    ];
    expect(() => {
      service.initPlugins();
    }).toThrow(/id and apply must supplied/);

    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerPlugin({
            apply() {},
          });
        },
      },
    ];
    expect(() => {
      service.initPlugins();
    }).toThrow(/id and apply must supplied/);
  });

  it('registerPlugin and changePluginOption', () => {
    const service = new Service({
      cwd: join(fixtures, 'plugins-empty'),
    });
    let newOption = null;
    service.plugins = [
      {
        id: 'user:a',
        apply: api => {
          api.registerPlugin({
            id: 'a',
            apply(api) {
              api.onOptionChange((...args) => {
                newOption = args[0];
              });
            },
          });
        },
      },
    ];
    service.initPlugins();
    service.plugins[0]._api.changePluginOption('a', {
      a: 'b',
    });
    expect(newOption).toEqual({ a: 'b' });
    expect(service.plugins[1].opts).toEqual({ a: 'b' });
  });
});
