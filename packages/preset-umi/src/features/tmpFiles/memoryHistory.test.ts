import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import type { MemoryHistory, MemoryHistoryOptions } from '@umijs/history';
import { Mustache } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { matchRoutes } from 'react-router-dom';
import { runInNewContext } from 'vm';

type Options = MemoryHistoryOptions & { basename?: string };

function createMemoryHistory(options: Options) {
  const template = readFileSync(
    join(__dirname, '../../../templates/history.tpl'),
    'utf8',
  );
  const source = Mustache.render(template, { historyPath: '@umijs/history' });
  const { code } = esbuild.transformSync(source, {
    loader: 'ts',
    format: 'cjs',
  });
  const mod = {
    exports: {} as {
      createHistory: (opts: Options & { type: 'memory' }) => MemoryHistory;
    },
  };
  runInNewContext(code, { module: mod, require });
  return mod.exports.createHistory({ type: 'memory', ...options });
}

test.each(['/', '/dawn', '/dawn/'])(
  'matches the index route on startup with base %s',
  (basename) => {
    const history = createMemoryHistory({ basename });
    expect(
      matchRoutes([{ path: '/' }], history.location, basename),
    ).toHaveLength(1);
  },
);

test('preserves explicit entries and their initial index', () => {
  const history = createMemoryHistory({
    basename: '/dawn',
    initialEntries: ['/dawn/first', '/dawn/second?tab=2'],
    initialIndex: 0,
  });
  expect(history.location.pathname).toBe('/dawn/first');
  history.forward();
  expect(history.location).toMatchObject({
    pathname: '/dawn/second',
    search: '?tab=2',
  });
});
