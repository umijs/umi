import { join } from 'path';
import UserConfig from './UserConfig';

const base = join(__dirname, './fixtures/UserConfig');

describe('static UserConfig', () => {
  const service = {
    applyPlugins(name, { initialValue }) {
      return initialValue;
    },
  };

  it('config/config.js', () => {
    const config = UserConfig.getConfig({
      cwd: join(base, 'config-config'),
      service,
    });
    expect(config).toEqual({
      alias: { a: 'b' },
      deep: {
        a: {
          b: '111',
          c: '222',
        },
      },
    });
  });

  it('config/config.js with custom', () => {
    process.env.UMI_ENV = 'custom';
    const config = UserConfig.getConfig({
      cwd: join(base, 'config-config'),
      service,
    });
    process.env.UMI_ENV = '';
    expect(config).toEqual({
      alias: { a: 'b' },
      custom: 1,
      deep: {
        a: {
          b: '333',
          c: '222',
        },
      },
    });
  });

  it('config/config.js with local', () => {
    process.env.NODE_ENV = 'development';
    const config = UserConfig.getConfig({
      cwd: join(base, 'config-config'),
      service,
    });
    process.env.NODE_ENV = '';
    expect(config).toEqual({
      alias: { a: 'b' },
      local: 1,
      deep: {
        a: {
          b: '111',
          c: '222',
        },
      },
    });
  });

  it('config/config.js with local and custom', () => {
    process.env.NODE_ENV = 'development';
    process.env.UMI_ENV = 'custom';
    const config = UserConfig.getConfig({
      cwd: join(base, 'config-config'),
      service,
    });
    process.env.NODE_ENV = '';
    process.env.UMI_ENV = '';
    expect(config).toEqual({
      alias: { a: 'b' },
      local: 1,
      custom: 1,
      deep: {
        a: {
          b: '333',
          c: '222',
        },
      },
    });
  });

  it('.umirc', () => {
    const config = UserConfig.getConfig({
      cwd: join(base, 'umirc'),
      service,
    });
    expect(config).toEqual({
      alias: { a: 'b' },
    });
  });

  it('.umirc with custom', () => {
    process.env.UMI_ENV = 'custom';
    const config = UserConfig.getConfig({
      cwd: join(base, 'umirc'),
      service,
    });
    process.env.UMI_ENV = '';
    expect(config).toEqual({
      alias: { a: 'b' },
      custom: 1,
    });
  });

  it('.umirc with custom', () => {
    process.env.NODE_ENV = 'development';
    const config = UserConfig.getConfig({
      cwd: join(base, 'umirc'),
      service,
    });
    process.env.NODE_ENV = '';
    expect(config).toEqual({
      alias: { a: 'b' },
      local: 1,
    });
  });

  it('no config file', () => {
    const config = UserConfig.getConfig({
      cwd: join(base, 'empty'),
      service,
    });
    expect(config).toEqual({});
  });
});

describe('instance UserConfig', () => {
  const cwd = join(base, 'umirc');
  const service = {
    cwd,
    paths: {
      cwd,
    },
    applyPlugins(name, { initialValue }) {
      if (name === 'modifyDefaultConfig') {
        return {
          alias: { a: 'default' },
          hd: true,
          local: 0,
        };
      } else if (name === '_registerConfig') {
        return ['alias', 'hd', 'local'].map(name => {
          return () => {
            return { name };
          };
        });
      } else {
        return initialValue;
      }
    },
  };

  it('modifyDefaultConfig', () => {
    process.env.NODE_ENV = 'development';
    const userConfig = new UserConfig(service);
    const config = userConfig.getConfig();
    process.env.NODE_ENV = '';
    expect(config).toEqual({
      alias: { a: 'b' },
      local: 1,
      hd: true,
    });
  });
});
