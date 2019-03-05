import {
  getConfigFile,
  mergeConfigs,
  addAffix,
} from './getUserConfig';

const fixtures = `${__dirname}/fixtures/getUserConfig`;

function stripPrefix(file) {
  return file.replace(`${fixtures}/`, '');
}

describe('getUserConfig', () => {
  it('addAffix', () => {
    expect(addAffix('/a/b.js', 'foo')).toEqual('/a/b.foo.js');
  });

  describe('getConfigFile', () => {
    it('.umirc.js', () => {
      expect(stripPrefix(getConfigFile(`${fixtures}/umirc`))).toEqual(
        'umirc/.umirc.js',
      );
    });

    it('config/config.js', () => {
      expect(
        stripPrefix(getConfigFile(`${fixtures}/config-directory`)),
      ).toEqual('config-directory/config/config.js');
    });

    it('conflicts', () => {
      expect(() => {
        getConfigFile(`${fixtures}/conflicts`);
      }).toThrow(/Multiple config files/);
    });
  });

  describe('mergeConfigs', () => {
    it('shallow', () => {
      expect(
        mergeConfigs({ foo: 1 }, { bar: 1 }, undefined, { bar: 2 }),
      ).toEqual({
        foo: 1,
        bar: 2,
      });
    });

    it('deep', () => {
      expect(
        mergeConfigs({ foo: { bar: 1, haa: 1 } }, { foo: { bar: 2, yaa: 1 } }),
      ).toEqual({
        foo: {
          bar: 2,
          haa: 1,
          yaa: 1,
        },
      });
    });
  });
});
