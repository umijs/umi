import { winPath } from 'umi-utils';
import { join } from 'path';
import getUserConfig, { getConfigFile, mergeConfigs, addAffix } from './getUserConfig';

const fixtures = winPath(`${__dirname}/fixtures/getUserConfig`);

function stripPrefix(file) {
  return file.replace(`${fixtures}/`, '');
}

describe('getUserConfig', () => {
  it('addAffix', () => {
    expect(addAffix('/a/b.js', 'foo')).toEqual('/a/b.foo.js');
  });

  describe('getConfigFile', () => {
    it('.umirc.js', () => {
      expect(stripPrefix(getConfigFile(`${fixtures}/umirc`))).toEqual('umirc/.umirc.js');
    });

    it('config/config.js', () => {
      expect(stripPrefix(getConfigFile(`${fixtures}/config-directory`))).toEqual(
        'config-directory/config/config.js',
      );
    });

    it('conflicts', () => {
      expect(() => {
        getConfigFile(`${fixtures}/conflicts`);
      }).toThrow(/Multiple config files/);
    });
  });

  describe('mergeConfigs', () => {
    it('shallow', () => {
      expect(mergeConfigs({ foo: 1 }, { bar: 1 }, undefined, { bar: 2 })).toEqual({
        foo: 1,
        bar: 2,
      });
    });

    it('deep', () => {
      expect(mergeConfigs({ foo: { bar: 1, haa: 1 } }, { foo: { bar: 2, yaa: 1 } })).toEqual({
        foo: {
          bar: 2,
          haa: 1,
          yaa: 1,
        },
      });
    });
  });
});

test('config with empty directory', () => {
  const config = getUserConfig({
    cwd: join(fixtures, 'normal'),
  });
  expect(config).toEqual({});
});

test('config with .umirc.js', () => {
  const config = getUserConfig({
    cwd: join(fixtures, 'config-umirc'),
  });
  expect(config).toEqual({
    history: 'hash',
  });
});

test('config with UMI_CONFIG_FILE env', () => {
  process.env.UMI_CONFIG_FILE = 'foo.js';
  const config = getUserConfig({
    cwd: join(fixtures, 'config-UMI_CONFIG_FILE'),
  });
  expect(config).toEqual({
    history: 'hash',
  });
  process.env.UMI_CONFIG_FILE = '';
});
