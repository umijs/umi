import expect from 'expect';
import { join } from 'path';
import getConfig, { validConfig } from '../src/getConfig/backup';

const fixtures = join(__dirname, 'fixtures/getConfig');

xdescribe('getConfig', () => {
  it('normal', () => {
    const config = getConfig(join(fixtures, 'normal'));
    expect(config).toEqual({
      pages: {},
      theme: {},
      browsers: [],
    });
  });

  it('parse failed', () => {
    expect(() => {
      getConfig(join(fixtures, 'parse-failed'));
    }).toThrow(/config parse failed/);
  });

  it('invalid key', () => {
    expect(() => {
      validConfig({
        a: 'b',
      });
    }).toThrow(/invalide config key a/);
  });

  it('invalid pages', () => {
    expect(() => {
      validConfig({
        pages: 'a',
      });
    }).toThrow(/pages config must be Plain Object/);
  });

  it('invalid theme', () => {
    expect(() => {
      validConfig({
        theme: 1,
      });
    }).toThrow(/theme config must be String or Plain Object/);
  });

  it('invalid browsers', () => {
    expect(() => {
      validConfig({
        browsers: 1,
      });
    }).toThrow(/browsers config must be Array/);
  });

  it('theme file not found', () => {
    expect(() => {
      getConfig(join(fixtures, 'theme-file-not-found'));
    }).toThrow(/theme file a.js not found/);
  });
});
