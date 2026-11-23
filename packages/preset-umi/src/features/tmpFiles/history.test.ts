/** @jest-environment jsdom */

import { Mustache, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { createRequire } from 'module';
import { join } from 'path';
import ts from 'typescript';
import { runInNewContext } from 'vm';

function loadHistory(historyPath: string) {
  const template = readFileSync(
    join(__dirname, '../../../templates/history.tpl'),
    'utf8',
  );
  const source = Mustache.render(template, { historyPath });
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const mod = { exports: {} as any };
  runInNewContext(outputText, { exports: mod.exports, require });
  return mod.exports;
}

test.each(['/app', '/app/'])(
  'query and hash strings keep the current pathname under %s',
  (basename) => {
    const generated = loadHistory('@umijs/history');
    generated.createHistory({
      type: 'memory',
      basename,
      initialEntries: ['/app/orders/42'],
    });
    const { history } = generated;
    history.push('?tab=items');
    expect(history.location).toMatchObject({
      pathname: '/app/orders/42',
      search: '?tab=items',
    });
    history.replace('#details');
    expect(history.location).toMatchObject({
      pathname: '/app/orders/42',
      hash: '#details',
    });
    history.push('');
    expect(history.location.pathname).toBe('/app/orders/42');
    history.push('/reports');
    expect(history.location.pathname).toBe('/app/reports');
  },
);

const rendererRequire = createRequire(
  require.resolve('@umijs/renderer-react/package.json'),
);

test.each([
  ['history', 'browser'],
  ['@umijs/history', 'browser'],
  ['history', 'hash'],
  ['@umijs/history', 'hash'],
])(
  'preserves repeated leading slashes with %s in %s history',
  (library, type) => {
    const pathname = '//orders';
    const { href, origin } = window.location;
    window.history.replaceState(
      null,
      '',
      type === 'browser' ? `/.${pathname}` : `/#${pathname}`,
    );

    try {
      const generated = loadHistory(
        library === 'history'
          ? winPath(rendererRequire.resolve(library))
          : library,
      );
      const navigator = generated.createHistory({ type, basename: '/app' });
      generated.history.push('?tab=items');
      expect(generated.history.location).toMatchObject({
        pathname,
        search: '?tab=items',
      });

      navigator.replace({ pathname, hash: '#details' });
      expect(generated.history.location).toMatchObject({
        pathname,
        hash: '#details',
      });
      expect(window.location.origin).toBe(origin);
    } finally {
      window.history.replaceState(null, '', href);
    }
  },
);
