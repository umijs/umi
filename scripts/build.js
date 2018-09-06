const vfs = require('vinyl-fs');
const babel = require('@babel/core');
const through = require('through2');
const chalk = require('chalk');
const rimraf = require('rimraf');
const { readdirSync, readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');
const chokidar = require('chokidar');
const shell = require('shelljs');
const slash = require('slash2');

const nodeBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          node: 6,
        },
      },
    ],
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-class-properties'),
  ],
};
const browserBabelConfig = {
  presets: [
    [
      require.resolve('@babel/preset-env'),
      {
        targets: {
          browsers: ['last 2 versions', 'IE 10'],
        },
      },
    ],
    require.resolve('@babel/preset-react'),
  ],
  plugins: [
    require.resolve('@babel/plugin-proposal-export-default-from'),
    require.resolve('@babel/plugin-proposal-do-expressions'),
    require.resolve('@babel/plugin-proposal-class-properties'),
  ],
};
const BROWSER_FILES = [
  'packages/umi/src/createHistory.js',
  'packages/umi/src/dynamic.js',
  'packages/umi/src/link.js',
  'packages/umi/src/navlink.js',
  'packages/umi/src/router.js',
  'packages/umi/src/renderRoutes.js',
  'packages/umi/src/withRouter.js',
  'packages/umi/src/utils.js',
  'packages/umi-build-dev/src/plugins/404/NotFound.js',
  'packages/umi-build-dev/src/utils/guessJSFileFromPath.js',
  'packages/umi-build-dev/src/Compiling.js',
  'packages/umi-build-dev/src/DefaultLayout.js',
  'packages/af-webpack/src/webpackHotDevClient.js',
  'packages/af-webpack/src/utils.js',
  'packages/af-webpack/src/formatWebpackMessages.js',
  'packages/af-webpack/src/socket.js',
  'packages/af-webpack/src/patchConnection.js',
];
const cwd = process.cwd();

function isBrowserTransform(path) {
  return BROWSER_FILES.includes(path.replace(`${slash(cwd)}/`, ''));
}

function transform(opts = {}) {
  const { content, path } = opts;
  const winPath = slash(path);
  const isBrowser = isBrowserTransform(winPath);
  console.log(
    chalk[isBrowser ? 'yellow' : 'blue'](
      `[TRANSFORM] ${winPath.replace(`${cwd}/`, '')}`,
    ),
  );
  const config = isBrowser ? browserBabelConfig : nodeBabelConfig;
  return babel.transform(content, config).code;
}

function buildPkg(pkg) {
  rimraf.sync(join(cwd, 'packages', pkg, 'lib'));
  const stream = vfs
    .src([
      `./packages/${pkg}/src/**/*.js`,
      `!./packages/${pkg}/src/**/fixtures/**/*.js`,
      `!./packages/${pkg}/src/**/*.test.js`,
    ])
    .pipe(
      through.obj((f, enc, cb) => {
        f.contents = new Buffer( // eslint-disable-line
          transform({
            content: f.contents,
            path: f.path,
          }),
        );
        cb(null, f);
      }),
    )
    .pipe(vfs.dest(`./packages/${pkg}/lib/`));
  if (pkg === 'umi-test') {
    stream.on('end', () => {
      shell.exec(`
echo '\\r\\nmodule.exports = exports["default"];' >> ./packages/umi-test/lib/transformers/jsTransformer.js
`);
      shell.exec(`
echo '\\r\\nmodule.exports = exports["default"];' >> ./packages/umi-test/lib/transformers/tsTransformer.js
`);
    });
  }
}

// buildPkg('umi');
function build() {
  const dirs = readdirSync(join(cwd, 'packages'));
  const arg = process.argv[2];
  const isWatch = arg === '-w' || arg === '--watch';
  dirs.forEach(pkg => {
    if (pkg.charAt(0) === '.') return;
    buildPkg(pkg);
    if (isWatch) {
      const watcher = chokidar.watch(join(cwd, 'packages', pkg, 'src'), {
        ignoreInitial: true,
      });
      watcher.on('all', (event, fullPath) => {
        if (!existsSync(fullPath)) return;
        const relPath = fullPath.replace(`${cwd}/packages/${pkg}/src/`, '');
        const content = readFileSync(fullPath, 'utf-8');
        try {
          const code = transform({
            content,
            path: fullPath,
          });
          writeFileSync(
            join(cwd, 'packages', pkg, 'lib', relPath),
            code,
            'utf-8',
          );
        } catch (e) {
          console.log(chalk.red('Compiled failed.'));
          console.log(chalk.red(e.message));
        }
      });
    }
  });
}

build();
