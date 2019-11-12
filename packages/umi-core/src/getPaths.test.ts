import { join } from 'path';
import getPaths from './getPaths';

const fixtures = join(__dirname, 'fixtures/getPaths');

test('normal', () => {
  const paths = getPaths({
    cwd: join(fixtures, 'normal'),
    config: {},
  });
  expect(paths.outputPath).toEqual('./dist');
  expect(paths.pagesPath).toEqual('pages');
});

test('UMI_TEMP_DIR env', () => {
  process.env.UMI_TEMP_DIR = 'foooo';
  const paths = getPaths({
    cwd: join(fixtures, 'normal'),
    config: {},
  });
  expect(paths.tmpDirPath).toEqual('foooo-production');
  process.env.UMI_TEMP_DIR = '';
});

test('PAGES_PATH env', () => {
  process.env.PAGES_PATH = 'foooo';
  const paths = getPaths({
    cwd: join(fixtures, 'normal'),
    config: {},
  });
  expect(paths.pagesPath).toEqual('foooo');
  process.env.PAGES_PATH = '';
});

test('test src/pages', () => {
  const paths = getPaths({
    cwd: join(fixtures, 'src-pages'),
    config: {},
  });
  expect(paths.pagesPath).toEqual('src/pages');
});

test('test src/page', () => {
  const paths = getPaths({
    cwd: join(fixtures, 'src-page'),
    config: {},
  });
  expect(paths.pagesPath).toEqual('src/page');
});

test('test page', () => {
  const paths = getPaths({
    cwd: join(fixtures, 'page'),
    config: {},
  });
  expect(paths.pagesPath).toEqual('page');
});
