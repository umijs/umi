import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { getLocaleList } from './localeUtils';

test.each(['-', '_', 'x', '.'])(
  'discovers language, script and region bundles with %s',
  async (separator) => {
    const root = mkdtempSync(join(tmpdir(), 'umi-locales-'));
    try {
      const pages = join(root, 'pages');
      const global = join(root, 'locales');
      const local = join(pages, 'orders', 'locales');
      mkdirSync(global);
      mkdirSync(local, { recursive: true });
      const names = [
        'en-US',
        'fil',
        'zh-Hant-TW',
        'sr-Latn',
        'sr-Cyrl',
        'es-419',
      ];
      for (const name of names.concat('messages')) {
        writeFileSync(
          join(global, name.replace(/-/g, separator) + '.json'),
          '{}',
        );
      }
      writeFileSync(join(local, 'fil.ts'), 'export default {};');
      writeFileSync(join(local, 'enUS.ts'), 'export default {};');
      const addAntdLocales = jest.fn(async () => []);
      const list = await getLocaleList({
        localeFolder: 'locales',
        separator,
        absSrcPath: root,
        absPagesPath: pages,
        addAntdLocales,
        resolveKey: 'moment',
      });
      expect(list.map((item) => item.locale).sort()).toEqual(names.sort());
      const english = list.find((item) => item.name === `en${separator}US`);
      expect(english?.locale).toBe('en-US');
      expect(english?.paths).toHaveLength(2);
      expect(list.find((item) => item.name === 'fil')?.paths).toHaveLength(2);
      expect(
        list.find((item) => item.name === ['zh', 'Hant', 'TW'].join(separator)),
      ).toMatchObject({ lang: 'zh', country: 'TW' });
      expect(addAntdLocales).toHaveBeenCalledWith({
        lang: 'es',
        country: '419',
      });
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  },
);
