import assert from 'assert';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { extname, join, resolve } from 'path';
import { IApi } from '../../types';

// TODO:
// - 支持通过 env.MPA_FILTER 过滤要启动的项目（提速）
// - precompile html-webpack-plugin
export default (api: IApi) => {
  api.describe({
    key: 'mpa',
    config: {
      schema(Joi) {
        return Joi.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.modifyAppData((memo) => {
    memo.mpa = {
      entry: collectEntry(api.paths.absPagesPath),
    };
    return memo;
  });

  api.onGenerateFiles(() => {
    // TODO: support react 18
    const isReact18 = api.appData.react.version.startsWith('18.');
    (api.appData.mpa.entry as Entry[]).forEach((entry) => {
      const layoutImport = entry.layout
        ? `import Layout from '${entry.layout}';`
        : '';
      const layoutJSX = entry.layout ? `<Layout><App /></Layout>` : `<App />`;
      const rootElement = `document.getElementById('${entry.mountElementId}')`;
      const renderer = isReact18
        ? `ReactDOM.createRoot(${rootElement}).render(${layoutJSX});`
        : `ReactDOM.render(${layoutJSX}, ${rootElement});`;
      api.writeTmpFile({
        path: entry.tmpFilePath,
        noPluginDir: true,
        content: `
import React from 'react';
import ReactDOM from 'react-dom';
import App from '${entry.file}';
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
      memo.plugin(`html-${entry.name}`).use(HtmlWebpackPlugin, [
        {
          filename: `${entry.name}.html`,
          minify: false,
          template: entry.template
            ? resolve(api.cwd, entry.template)
            : join(api.paths.absTmpPath, 'mpa/template.html'),
          templateParameters: {
            ...entry,
            title: entry.title || entry.name,
          },
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

function collectEntry(root: string) {
  return readdirSync(root).reduce<Entry[]>((memo, dir) => {
    const absDir = join(root, dir);
    if (existsSync(absDir) && statSync(absDir).isDirectory()) {
      const indexFile = getIndexFile(absDir);
      if (indexFile) {
        memo.push({
          name: dir,
          file: indexFile,
          tmpFilePath: `mpa/${dir}${extname(indexFile)}`,
          mountElementId: 'root',
          ...getConfig(absDir),
        });
      }
    }
    return memo;
  }, []);
}

function getIndexFile(dir: string) {
  if (existsSync(join(dir, 'index.tsx'))) return join(dir, 'index.tsx');
  if (existsSync(join(dir, 'index.ts'))) return join(dir, 'index.ts');
  if (existsSync(join(dir, 'index.jsx'))) return join(dir, 'index.jsx');
  if (existsSync(join(dir, 'index.js'))) return join(dir, 'index.js');
  return null;
}

function getConfig(dir: string) {
  if (existsSync(join(dir, 'config.json'))) {
    const config = JSON.parse(readFileSync(join(dir, 'config.json'), 'utf-8'));
    checkConfig(config);
    return config;
  }
  return {};
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
