import fs, { existsSync } from 'fs';
import { join } from 'path';
import { IApi } from 'umi';
import { parseTitle } from './markdown';

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

  api.onGenerateFiles(() => {
    const themeConfigPath = join(api.cwd, 'theme.config.ts');
    const themeExists = existsSync(themeConfigPath);

    // 将 docs/locales 目录下的 json 文件注入到 themeConfig.locales 中
    let injectLocale = 'themeConfig.locales = {};';
    const localesPath = join(api.cwd, 'docs/locales');
    if (existsSync(localesPath)) {
      fs.readdirSync(localesPath).forEach((file) => {
        if (file.endsWith('.json')) {
          const filePath = join(localesPath, file);
          const content = fs.readFileSync(filePath).toString();
          const json = JSON.parse(content);
          const localeName = file.replace('.json', '');
          injectLocale += `themeConfig.locales['${localeName}'] = ${JSON.stringify(
            json,
          )};
`;
        }
      });
    }

    // @TODO: 需要能够动态解析 theme 中导出的组件，现在是硬编码
    api.writeTmpFile({
      path: 'index.ts',
      content: `
export { Message, Hero, Features, FeatureItem } from '${require.resolve(
        '../client/theme-doc',
      )}';
    `,
    });

    api.writeTmpFile({
      path: 'Layout.tsx',
      content: `
import React from 'react';
import { useOutlet, useAppData, useLocation, Link } from 'umi';
import { Layout } from '${require.resolve('../client/theme-doc')}';
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
