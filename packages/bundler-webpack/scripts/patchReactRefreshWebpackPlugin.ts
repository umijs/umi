import fs from 'fs-extra';
import { globbySync } from 'globby';
import path from 'path';

// ref: https://github.com/alibaba/ice/blob/master/packages/bundles/scripts/tasks.ts

function replaceDeps(code: string, deps: string[]) {
  return deps.reduce((acc, curr) => {
    return (
      acc
        // cjs
        .replace(
          new RegExp(`require\\(["']${curr}["']\\)`, 'g'),
          `require("${`@umijs/bundler-webpack/compiled/${curr}`}")`,
        )
        // esm
        .replace(
          new RegExp(`from ["']${curr}["']`, 'g'),
          `from "${`@umijs/bundler-webpack/compiled/${curr}`}"`,
        )
    );
  }, code);
}

const commonDeps = [
  'autoprefixer',
  'babel-loader',
  'copy-webpack-plugin',
  'css-loader',
  'css-minimizer-webpack-plugin',
  'cssnano',
  'compression',
  'connect-history-api-fallback',
  'less-loader',
  'mini-css-extract-plugin',
  'postcss-flexbugs-fixes',
  'postcss-loader',
  'purgecss-webpack-plugin',
  'sass-loader',
  'schema-utils',
  'style-loader',
  'speed-measure-webpack-plugin',
  'svgo-loader',
  'terser',
  'terser-webpack-plugin',
  'url-loader',
  'file-loader',
  'webpack-5-chain',
  'webpack-bundle-analyzer',
  'webpack-dev-middleware',
  'webpack-manifest-plugin',
  'webpack-sources',
  'webpackbar',
  'ws',
];

// Copy @pmmmwh/react-refresh-webpack-plugin while all dependencies has been packed.
const pkgPath = path.join(
  __dirname,
  '../node_modules/@pmmmwh/react-refresh-webpack-plugin',
);
const filePaths = globbySync(['**/*'], {
  cwd: pkgPath,
  ignore: ['node_modules', 'types'],
});
filePaths.forEach((filePath) => {
  fs.ensureDirSync(
    path.join(
      __dirname,
      `../compiled/@pmmmwh/react-refresh-webpack-plugin/${path.dirname(
        filePath,
      )}`,
    ),
  );
  const sourcePath = path.join(pkgPath, filePath);
  const targetPath = path.join(
    __dirname,
    `../compiled/@pmmmwh/react-refresh-webpack-plugin/${filePath}`,
  );
  if (path.extname(filePath) === '.js') {
    const fileContent = fs.readFileSync(sourcePath, 'utf8');
    // Add source-map for react-refresh-webpack-plugin, while other dependencies should pack it.
    fs.writeFileSync(targetPath, replaceDeps(fileContent, commonDeps));
  } else {
    fs.copyFileSync(sourcePath, targetPath);
  }
});
// Overwrite RefreshUtils.js which is customized for ice.js.
fs.copyFileSync(
  path.join(__dirname, './override/RefreshUtils.js'),
  path.join(pkgPath, 'lib/runtime/RefreshUtils.js'),
);
