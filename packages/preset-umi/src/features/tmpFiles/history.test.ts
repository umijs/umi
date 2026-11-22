import esbuild from '@umijs/bundler-utils/compiled/esbuild';
import { Mustache } from '@umijs/utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runInNewContext } from 'vm';

test.each(['/app', '/app/'])(
  'query and hash strings keep the current pathname under %s',
  (basename) => {
    const template = readFileSync(
      join(__dirname, '../../../templates/history.tpl'),
      'utf8',
    );
    const source = Mustache.render(template, { historyPath: '@umijs/history' });
    const { code } = esbuild.transformSync(source, {
      loader: 'ts',
      format: 'cjs',
    });
    const mod = { exports: {} as any };
    runInNewContext(code, { module: mod, require });
    mod.exports.createHistory({
      type: 'memory',
      basename,
      initialEntries: ['/app/orders/42'],
    });
    const { history } = mod.exports;
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
