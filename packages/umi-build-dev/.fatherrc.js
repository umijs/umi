import glob from 'glob';
import { join } from 'path';
import slash from 'slash2';

// 获取所有的 ui 下 tsx
const src = join(__dirname, 'src', 'plugins', 'commands', 'block', 'ui');
const files = glob.sync('**/*.@(tsx|jsx)', { cwd: src });
const browserFiles = files.map(filePath =>
  slash(join('src', 'plugins', 'commands', 'block', 'ui', filePath)),
);
export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  browserFiles: [
    'src/findRoute.js',
    'src/plugins/404/NotFound.js',
    'src/plugins/404/guessJSFileFromPath.js',
    'src/plugins/commands/dev/injectUI.js',
    'src/plugins/commands/block/sdk/flagBabelPlugin/GUmiUIFlag.tsx',
    ...browserFiles,
  ],
};
