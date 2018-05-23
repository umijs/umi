import { join } from 'path';
import UserConfig from './UserConfig';

const base = join(__dirname, './fixtures/UserConfig');
const service = {};

describe('UserConfig', () => {
  it('config/config.js', () => {
    const config = UserConfig.getConfig({
      cwd: join(base, 'config-config'),
      service,
    });
    expect(config).toEqual({
      alias: { a: 'b' },
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
