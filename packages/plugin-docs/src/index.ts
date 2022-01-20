import { join } from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.modifyDefaultConfig((memo) => {
    memo.conventionRoutes = {
      ...memo.conventionRoutes,
      base: join(api.cwd, 'docs'),
    };
    memo.mdx = {
      loader: require.resolve('./loader'),
      loaderOptions: {},
    };
    return memo;
  });

  api.addLayouts(() => {
    return [
      {
        id: 'docs-layout',
        file: withTmpPath({ api, path: 'Layout.tsx' }),
      },
    ];
  });

  api.onPatchRoute(({ route }) => {
    if (route.__content) {
      const firstLine = route.__content.trim().split('\n')[0];
      let title = '';
      if (firstLine.startsWith('# ')) {
        title = firstLine.slice(2);
      }
      route.title = title;
    }
  });

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'Layout.tsx',
      content: `
import React from 'react';
import { useOutlet, useAppData, Link } from 'umi';
import { Layout } from '${require.resolve('../client/theme-doc')}';

export default () => {
  const outlet = useOutlet();
  const appData = useAppData();
  return (
    <Layout appData={appData} components={{Link}}>
      <div>{ outlet }</div>
    </Layout>
  );
};
    `,
    });
  });
};

function withTmpPath(opts: { api: IApi; path: string; noPluginDir?: boolean }) {
  return join(
    opts.api.paths.absTmpPath,
    opts.api.plugin.key && !opts.noPluginDir
      ? `plugin-${opts.api.plugin.key}`
      : '',
    opts.path,
  );
}
