import { parseModuleSync } from '@umijs/bundler-utils';
import { winPath } from '@umijs/utils';
import fs, { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import { parseTitle } from './markdown';

export default (api: IApi) => {
  // 把用户当前有设置在 docs/locales 下的语系放到变量 locales 中，方便后续使用
  const locales: { [locale: string]: { [key: string]: string } } = {};
  const localesPath = join(api.cwd, 'docs/locales');
  if (existsSync(localesPath)) {
    fs.readdirSync(localesPath).forEach((file) => {
      if (file.endsWith('.json')) {
        const filePath = join(localesPath, file);
        const content = fs.readFileSync(filePath).toString();
        const json = JSON.parse(content);
        const localeName = file.replace('.json', '');
        locales[localeName] = json;
      }
    });
  }

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
      route.titles = parseTitle({
        content: route.__content,
      });
    }
    // 放在 docs/xxx.zh-CN.md 的文档，会被映射到 /zh-CN/docs/xxx 目录
    if (route.file.match(/.[a-z]{2}-[A-Z]{2}.md$/)) {
      route.path = route.path.replace(/(.*).([a-z]{2}-[A-Z]{2})$/, '$2/$1');

      // 放在 docs/xxx/README.zh-CN.md 格式结尾的文档，会被映射到 /zh-CN/docs 目录
      if (route.path.endsWith('README')) {
        route.path = route.path.replace(/README$/, '');
      }
    }
  });

  // 检查路由是否存在其他语言，没有的话做 fallback 处理
  api.modifyRoutes((r) => {
    if (!locales) return r;
    for (const route in r) {
      if (r[route].path.match(/^[a-z]{2}-[A-Z]{2}\/.*/)) continue;
      const defaultLangFile = r[route].file.replace(
        /(.[a-z]{2}-[A-Z]{2})?.md$/,
        '',
      );
      Object.keys(locales).map((l) => {
        if (r[defaultLangFile] && !r[defaultLangFile + '.' + l]) {
          r[defaultLangFile + '.' + l] = {
            ...r[defaultLangFile],
            path: `/${l}/${r[defaultLangFile].path}`,
          };
        }
      });
    }
    return r;
  });

  api.onGenerateFiles(() => {
    // theme path
    let theme =
      api.config.docs?.theme || require.resolve('../client/theme-doc/index.ts');
    if (theme === 'blog') {
      theme = require.resolve('../client/theme-blog/index.ts');
    }
    theme = winPath(theme);

    const themeConfigPath = winPath(join(api.cwd, 'theme.config.ts'));
    const themeExists = existsSync(themeConfigPath);

    // 将 docs/locales 目录下的 json 文件注入到 themeConfig.locales 中
    let injectLocale = `themeConfig.locales = ${JSON.stringify(locales)};`;

    // exports don't start with $ will be MDX Component
    const [_, exports] = parseModuleSync({
      content: readFileSync(theme, 'utf-8'),
      path: theme,
    });
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export { ${exports
        .filter((item) => !item.startsWith('$'))
        .join(', ')} } from '${winPath(
        require.resolve('../client/theme-doc/index.ts'),
      )}';
    `,
    });

    api.writeTmpFile({
      path: 'Layout.tsx',
      content: `
import React from 'react';
import { useOutlet, useAppData, useLocation, Link } from 'umi';
import { $Layout as Layout } from '${winPath(
        require.resolve('../client/theme-doc/index.ts'),
      )}';
${
  themeExists
    ? `import themeConfig from '${themeConfigPath}'`
    : `const themeConfig = {}`
}

${injectLocale}

export default () => {
  const outlet = useOutlet();
  const appData = useAppData();
  const location = useLocation();
  return (
    <Layout appData={appData} components={{Link}} themeConfig={themeConfig} location={location}>
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
