import { IApi } from '@umijs/types';
import { resolve } from '@umijs/utils';
import { dirname, join } from 'path';

export default (api: IApi) => {
  api.chainWebpack((memo) => {
    const reactDOMPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'react-dom',
      }) || dirname(require.resolve('react-dom/package.json'));
    const reactDOMVersion = require(join(reactDOMPath, 'package.json')).version;
    const isLT18 = !reactDOMVersion.startsWith('18.');
    if (isLT18) {
      const reactDom = memo.resolve.alias.get('react-dom');
      memo.resolve.alias.set('react-dom/client', reactDom);
      memo.resolve.alias.delete('react-dom');
      memo.resolve.alias.set('react-dom', reactDom);
    }
    return memo;
  });
};

function resolveProjectDep(opts: { pkg: any; cwd: string; dep: string }) {
  if (
    opts.pkg.dependencies?.[opts.dep] ||
    opts.pkg.devDependencies?.[opts.dep]
  ) {
    return dirname(
      resolve.sync(`${opts.dep}/package.json`, {
        basedir: opts.cwd,
      }),
    );
  }
  return undefined;
}
