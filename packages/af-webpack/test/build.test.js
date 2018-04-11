import webpack from 'webpack';
import glob from 'glob';
import { join } from 'path';
import { readFileSync, readdirSync, existsSync } from 'fs';
import getUserConfig from '../src/getUserConfig';
import getConfig from '../src/getConfig';

process.env.NODE_ENV = 'production';
process.env.COMPRESS = 'none';
process.env.ESLINT = 'none';
process.env.TSLINT = 'none';
process.env.__FROM_TEST = true;

function getEntry(cwd) {
  if (existsSync(join(cwd, 'index.ts'))) {
    return join(cwd, 'index.ts');
  } else {
    return join(cwd, 'index.js');
  }
}

function build(opts, done) {
  const { config: userConfig } = getUserConfig({
    cwd: opts.cwd,
  });
  const webpackConfig = getConfig({
    ...opts,
    ...userConfig,
  });
  webpackConfig.entry = {
    index: getEntry(opts.cwd),
  };
  webpackConfig.output.path = join(opts.cwd, 'dist');
  const compiler = webpack(webpackConfig);
  compiler.run(err => {
    if (err) {
      throw new Error(err);
    } else {
      done();
    }
  });
}

function assertBuildResult(cwd) {
  const actualDir = join(cwd, 'dist');
  const expectDir = join(cwd, 'expected');

  const actualFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });
  const expectFiles = glob.sync('**/*', { cwd: actualDir, nodir: true });

  expect(actualFiles.length).toEqual(expectFiles.length);

  actualFiles.forEach(file => {
    const actualFile = readFileSync(join(actualDir, file), 'utf-8');
    const expectFile = readFileSync(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

describe('build', () => {
  const fixtures = join(__dirname, './fixtures');
  readdirSync(fixtures)
    .filter(dir => dir.charAt(0) !== '.')
    .forEach(dir => {
      const fn = dir.indexOf('-only') > -1 ? it.only : it;
      fn(dir, done => {
        const cwd = join(fixtures, dir);
        process.chdir(cwd);
        build(
          {
            cwd,
            outputPath: join(cwd, 'dist'),
            disableCSSModules: dir.indexOf('cssModulesExcludes') === -1,
          },
          () => {
            try {
              assertBuildResult(cwd);
              done();
            } catch (e) {
              done(e);
            }
          },
        );
      });
    });
});
