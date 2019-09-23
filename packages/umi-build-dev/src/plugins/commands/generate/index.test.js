import { join } from 'path';
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import rimraf from 'rimraf';
import Service from '../../../Service';

process.env.UMI_TEST = '1';

let s;
const cwd = join(__dirname, 'fixtures', 'normal');

beforeAll(() => {
  s = new Service({
    cwd,
  });
  s.init();
});

// 需要 testEnvironment 为 node，但设置了其他会报错
xtest('g page users', async () => {
  await s.runCommand('generate', {
    _: ['page', 'users'],
  });
  const files = readdirSync(join(cwd, 'pages'));
  expect(files.includes('users.js')).toEqual(true);
  expect(files.includes('users.css')).toEqual(true);
  rimraf.sync(join(cwd, 'pages', 'users.js'));
  rimraf.sync(join(cwd, 'pages', 'users.css'));
});
