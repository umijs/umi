import expect from 'expect';
import webpack from 'webpack';
import glob from 'glob';
import { join } from 'path';
import {
  readFileSync as readFile,
  readdirSync as readdir,
  existsSync as exists,
} from 'fs';
import getConfig from '../src/getConfig';

function build(env, opts, done) {
  if (!opts.cwd) {
    throw new Error('opts.cwd must be supplied.');
  }
  const configFile = join(opts.cwd, 'config.json');
  const localConfig = exists(configFile)
    ? JSON.parse(readFile(configFile, 'utf-8'))
    : {};
  const config = getConfig(env, {
    ...opts,
    noCompress: true,
    ...localConfig,
  });
  config.entry = {
    index: join(opts.cwd, 'index.js'),
  };
  config.output.path = join(opts.cwd, 'dist');
  const compiler = webpack(config);
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
    const actualFile = readFile(join(actualDir, file), 'utf-8');
    const expectFile = readFile(join(expectDir, file), 'utf-8');
    expect(actualFile).toEqual(expectFile);
  });
}

describe('index', () => {
  const fixtures = join(__dirname, './fixtures');
  readdir(fixtures)
    .filter(dir => dir.charAt(0) !== '.')
    .forEach(dir => {
      const fn = dir.indexOf('-only') > -1 ? it.only : it;
      fn(dir, done => {
        const cwd = join(fixtures, dir);
        process.chdir(cwd);
        build(
          'production',
          {
            cwd,
            outputPath: join(cwd, 'dist'),
          },
          () => {
            assertBuildResult(cwd);
            done();
          },
        );
      });
    });
});
