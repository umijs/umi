import { join } from 'path';
import { readdirSync } from 'fs';
import got from 'got';
import Service from '../../../Service';

process.env.UMI_TEST = '1';

process.env.UMI_DIR = join(__dirname, '../../../../../umi');

let s;
const cwd = join(__dirname, 'fixtures', 'normal');

beforeAll(() => {
  process.env.WATCH_FILES = 'none';
  process.env.BROWSER = 'none';
  process.env.CLEAR_CONSOLE = 'none';
  s = new Service({
    cwd,
  });
  s.init();
});

afterAll(() => {
  process.env.WATCH_FILES = '';
  process.env.BROWSER = '';
  process.env.CLEAR_CONSOLE = '';
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

xtest('dev', async () => {
  const { port, server } = await s.runCommand('dev', {
    _: [],
  });
  await delay(2000);
  const { body } = await got(`http://localhost:${port}`);
  expect(body).toContain('<script src="/umi.js"></script>');
  server.close();
});
