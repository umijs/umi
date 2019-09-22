import { join } from 'path';
import rimraf from 'rimraf';
import { writeFileSync } from 'fs';
import { watch, unwatch, toAbsolute } from './watch';

const fixtures = join(__dirname, 'fixtures');

xtest('watch', done => {
  const fixture = join(fixtures, 'normal');
  const foo = join(fixture, 'foo.js');
  writeFileSync(foo, '1', 'utf-8');
  const watcher = watch('foo', [foo]);
  watcher.on('change', file => {
    expect(file.endsWith('foo.js')).toEqual(true);
    unwatch();
    rimraf.sync(foo);
    done();
  });
  setTimeout(() => {
    writeFileSync(foo, '2', 'utf-8');
  }, 500);
  setTimeout(() => {
    writeFileSync(foo, '3', 'utf-8');
  }, 1000);
  setTimeout(() => {
    writeFileSync(foo, '4', 'utf-8');
  }, 1500);
  setTimeout(() => {
    writeFileSync(foo, '5', 'utf-8');
  }, 2000);
});

test('WATCH_FILES=none', () => {
  process.env.WATCH_FILES = 'none';
  expect(watch()).toEqual(undefined);
  process.env.WATCH_FILES = '';
});

test('toAbsolute', () => {
  expect(toAbsolute('/abc')).toEqual('/abc');
  expect(toAbsolute('abc') !== 'abc').toEqual(true);
});
