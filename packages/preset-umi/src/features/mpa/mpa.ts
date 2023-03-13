import { chalk, logger, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import { IApi } from '../../types';

// TODO:
// - 支持通过 env.MPA_FILTER 过滤要启动的项目（提速）
// - precompile html-webpack-plugin
export default (api: IApi) => {
  api.describe({
    key: 'mpa',
    config: {
      schema({ zod }) {
        return zod
          .object({
            template: zod.string(),
            layout: zod.string(),
            getConfigFromEntryFile: zod.boolean(),
            entry: zod.object({}),
          })
          .deepPartial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onStart(() => {
    logger.warn(chalk.yellow('[MPA] MPA Mode Enabled'));
  });

  api.modifyAppData(async (memo) => {
    memo.mpa = {
      entry: await collectEntryWithTimeCount(
        api.paths.absPagesPath,
        api.config.mpa,
      ),
    };
    return memo;
  });

  api.onGenerateFiles(async ({ isFirstTime }) => {
    // Config HMR
    if (!isFirstTime) {
      api.appData.mpa.entry = await collectEntryWithTimeCount(
        api.paths.absPagesPath,
        api.config.mpa,
      );
    }

    const isReact18 = api.appData.react.version.startsWith('18.');
    (api.appData.mpa.entry as Entry[]).forEach((entry) => {
      const layout = entry.layout || api.config.mpa.layout;
      const layoutImport = layout ? `import Layout from '${layout}';` : '';
      const layoutJSX = layout ? `<Layout><App /></Layout>` : `<App />`;
      const rootElement = `document.getElementById('${entry.mountElementId}')`;
      const renderer = isReact18
        ? `ReactDOM.createRoot(${rootElement}).render(${layoutJSX});`
        : `ReactDOM.render(${layoutJSX}, ${rootElement});`;
      const reactDOMSource = isReact18 ? 'react-dom/client' : 'react-dom';
      api.writeTmpFile({
        path: entry.tmpFilePath,
        noPluginDir: true,
        content: `
import React from 'react';
import ReactDOM from '${reactDOMSource}';
import App from '${winPath(entry.file)}';
${layoutImport}
${renderer}
        `.trimStart(),
      });
    });

    api.writeTmpFile({
      path: 'mpa/template.html',
      noPluginDir: true,
      content: `
<!DOCTYPE html>
<html>
<head><title><%= title %></title></head>
<body>
<div id="<%= mountElementId %>"></div>
</body>
</html>
      `.trimStart(),
    });
  });

  api.modifyEntry((memo) => {
    if ('umi' in memo) delete memo['umi'];
    (api.appData.mpa.entry as Entry[]).forEach((entry) => {
      memo[entry.name] = join(api.paths.absTmpPath, entry.tmpFilePath);
    });
    return memo;
  });

  api.chainWebpack((memo) => {
    (api.appData.mpa.entry as Entry[]).forEach((entry) => {
      memo.plugin(`html-${entry.name}`).use(require('html-webpack-plugin'), [
        {
          filename: `${entry.name}.html`,
          minify: false,
          template: entry.template
            ? resolve(api.cwd, entry.template)
            : api.config.mpa.template
            ? resolve(api.cwd, api.config.mpa.template)
            : join(api.paths.absTmpPath, 'mpa/template.html'),
          // TODO: support html hmr
          templateParameters: entry,
          chunks: [entry.name],
        },
      ]);
    });
    return memo;
  });
};

interface Entry {
  [key: string]: string;
}

interface IMpaOpts {
  template: string;
  layout: string;
  getConfigFromEntryFile: boolean;
  entry: Record<string, Record<string, any>>;
}

async function collectEntryWithTimeCount(root: string, opts: IMpaOpts) {
  const d = new Date();
  const entries = await collectEntry(root, opts);
  logger.info(
    `[MPA] Collect Entries in ${new Date().getTime() - d.getTime()}ms`,
  );
  return entries;
}

async function collectEntry(root: string, opts: IMpaOpts) {
  return await readdirSync(root).reduce<Promise<Entry[]>>(
    async (memoP, dir) => {
      const memo = await memoP;
      const absDir = join(root, dir);
      if (existsSync(absDir) && statSync(absDir).isDirectory()) {
        const indexFile = getIndexFile(absDir);
        if (indexFile) {
          const config = opts.getConfigFromEntryFile
            ? await getConfigFromEntryFile(indexFile)
            : await getConfig(indexFile);
          const name = dir;
          const globalConfig = opts.entry?.[dir];
          memo.push({
            name,
            file: indexFile,
            tmpFilePath: `mpa/${dir}${extname(indexFile)}`,
            mountElementId: 'root',
            ...globalConfig,
            ...config,
            title: globalConfig?.title || config.title || dir,
          });
        }
      }
      return memo;
    },
    Promise.resolve([]),
  );
}

function getIndexFile(dir: string) {
  if (existsSync(join(dir, 'index.tsx'))) return join(dir, 'index.tsx');
  if (existsSync(join(dir, 'index.ts'))) return join(dir, 'index.ts');
  if (existsSync(join(dir, 'index.jsx'))) return join(dir, 'index.jsx');
  if (existsSync(join(dir, 'index.js'))) return join(dir, 'index.js');
  return null;
}

async function getConfig(indexFile: string) {
  const dir = dirname(indexFile);
  if (existsSync(join(dir, 'config.json'))) {
    const config = JSON.parse(readFileSync(join(dir, 'config.json'), 'utf-8'));
    checkConfig(config);
    return config;
  } else {
    return {};
  }
}

async function getConfigFromEntryFile(indexFile: string) {
  const { extractExports } = await import('./extractExports.js');
  const config = await extractExports({
    entry: indexFile,
    exportName: 'config',
  });
  checkConfig(config);
  return config;
}

function checkConfig(config: any) {
  if (config.layout) {
    assert(
      typeof config.layout === 'string' &&
        (config.layout.startsWith('@/') || config.layout.startsWith('/')),
      `layout must be an absolute path or start with '@/'`,
    );
  }
  if (config.template) {
    assert(typeof config.template === 'string', 'template must be string');
  }
  if (config.title) {
    assert(typeof config.title === 'string', 'title must be string');
  }
  if (config.head) {
    assert(Array.isArray(config.head), 'head must be string');
  }
  if (config.scripts) {
    assert(Array.isArray(config.scripts), 'scripts must be string');
  }
}
