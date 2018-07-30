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
});
