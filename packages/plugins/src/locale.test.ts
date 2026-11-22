/** @jest-environment jsdom */
import { Mustache } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import ts from 'typescript';
import { runInNewContext } from 'vm';

function loadLocale(useLocalStorage: boolean) {
  const template = readFileSync(
    join(__dirname, '../templates/locale/localeExports.tpl'),
    'utf8',
  );
  const source = Mustache.render(template, {
    DefaultLocale: JSON.stringify('en-US'),
    UseLocalStorage: useLocalStorage,
    BaseSeparator: '-',
    LocaleList: ['en-US', 'fr-FR'].map((name) => ({ name, locale: name })),
    EventEmitterPkg: 'event-emitter',
    reactIntlPkgPath: 'react-intl',
    warningPkgPath: 'warning',
  });
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
  });
  const localeExports: Record<string, any> = {};
  runInNewContext(outputText, {
    exports: localeExports,
    window,
    navigator,
    localStorage,
    Event,
    require(id: string) {
      if (id === '../core/plugin') {
        return {
          getPluginManager: () => ({
            applyPlugins: ({ initialValue }: any) => initialValue,
          }),
        };
      }
      return require(id);
    },
  });
  return localeExports;
}

afterEach(() => localStorage.clear());

test('switches languages in both directions without using localStorage', () => {
  localStorage.setItem('umi_locale', 'previous');
  const { setLocale, getLocale, getIntl, event, LANG_CHANGE_EVENT } =
    loadLocale(false);
  const onChange = jest.fn();
  event.on(LANG_CHANGE_EVENT, onChange);
  expect(getLocale()).toBe('en-US');
  setLocale('fr-FR', false);
  expect(getLocale()).toBe('fr-FR');
  expect(getIntl().locale).toBe('fr-FR');
  setLocale('en-US', false);
  expect(getIntl().locale).toBe('en-US');
  expect(onChange.mock.calls).toEqual([['fr-FR'], ['en-US']]);
  expect(localStorage.getItem('umi_locale')).toBe('previous');
});

test('reads and updates the stored language when persistence is enabled', () => {
  localStorage.setItem('umi_locale', 'fr-FR');
  const { setLocale, getLocale } = loadLocale(true);
  expect(getLocale()).toBe('fr-FR');
  setLocale('en-US', false);
  expect(localStorage.getItem('umi_locale')).toBe('en-US');
  expect(getLocale()).toBe('en-US');
});
