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

  it('.umirc', () => {
    const config = UserConfig.getConfig({
      cwd: join(base, 'umirc'),
      service,
    });
    expect(config).toEqual({
      alias: { a: 'b' },
    });
  });
});
