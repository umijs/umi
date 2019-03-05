import { join, isAbsolute } from 'path';
import { existsSync } from 'fs';
import registerBabel from 'af-webpack/registerBabel';
import { winPath } from 'umi-utils';
import { getConfigPaths } from 'umi-core/lib/getUserConfig';

let files = null;

function initFiles(cwd) {
  if (files) return;
  files = getConfigPaths(cwd);
}

export function addBabelRegisterFiles(extraFiles, { cwd }) {
  initFiles(cwd);
  files.push(...extraFiles);
}

export default function({ cwd }) {
  initFiles(cwd);
  const only = files.map(f => {
    const fullPath = isAbsolute(f) ? f : join(cwd, f);
    return winPath(fullPath);
  });

  let absSrcPath = join(cwd, 'src');
  if (!existsSync(absSrcPath)) {
    absSrcPath = cwd;
  }

  registerBabel({
    // only suport glob
    // ref: https://babeljs.io/docs/en/next/babel-core.html#configitem-type
    only,
    babelPreset: [
      require.resolve('babel-preset-umi'),
      {
        env: { targets: { node: 8 } },
        transformRuntime: false,
      },
    ],
    babelPlugins: [
      [
        require.resolve('babel-plugin-module-resolver'),
        {
          alias: {
            '@': absSrcPath,
          },
        },
      ],
    ],
  });
}
