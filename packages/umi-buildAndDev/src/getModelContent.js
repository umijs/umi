import {
  readdirSync as readdir,
  statSync as stat,
  existsSync as exists,
} from 'fs';
import { join } from 'path';
import { MODELS, KOI_DIRECTORY } from './constants';
import { getConfig } from './getConfig';

export default function getModelContent(root, dirPath = '') {
  const config = getConfig(root);
  const path = join(root, dirPath);
  const files = readdir(path);

  let content = `
import { AppModel } from 'koi/model';
const app = new AppModel();
`;

  const middlewarePath = join(path, './middleware.js');
  if (exists(middlewarePath)) {
    content += `
const middlewares = require('${middlewarePath}').default;
middlewares.forEach(middleware => app.addMiddleware(middleware));  
`;
  }

  return (
    content +
    files
      .map(file => {
        if (file === '.' || file === '..') return '';
        const stats = stat(join(path, file));
        if (stats.isDirectory() && file !== KOI_DIRECTORY) {
          return buildModelConfig(file, root);
        } else {
          return '';
        }
      })
      .join('\n') +
    `export default app;`
  );
}

// 根据models目录下的文件，生成model的加载代码
function buildModelConfig(entryName, entryPath) {
  const fullPath = join(entryPath, entryName);

  const dir = join(fullPath, MODELS);
  if (!exists(dir)) {
    return '';
  }
  const models = [];
  readdir(dir).forEach(fullName => {
    if (/\.(js)$/i.test(fullName) || /\.(ts)$/i.test(fullName)) {
      const fileName = fullName.substr(0, fullName.lastIndexOf('.'));
      const modelPath = `../../page/${entryName}/${MODELS}/${fileName}`;
      models.push({
        fileName,
        modelPath,
      });
    }
  });
  return models
    .map(model => {
      return `const ${model.fileName} = require('${model.modelPath}');
app.mount(new ${model.fileName}.default());`;
    })
    .join('\n');
}

// TODO：dev 模式下如果每次修改 pages 下的内容都重新生成配置，可能会有性能问题
