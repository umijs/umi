import { join } from 'path';
import { fork } from 'child_process';
import puppeteer from 'puppeteer';
import http from 'http';
import { existsSync, readdirSync } from 'fs';

interface IServer {
  [key: string]: {
    port: number;
    server?: any;
  };
}

let port = 12400;
const servers = {} as IServer;
let browser: any;
let page: any;
const fixtures = join(__dirname, 'fixtures/build');
let dirs = readdirSync(fixtures).filter(dir => dir.charAt(0) !== '.');
const testOnly = dirs.some(dir => /-only/.test(dir));
if (testOnly) {
  dirs = dirs.filter(dir => /-only/.test(dir));
}
dirs = dirs.filter(dir => !/^x-/.test(dir));

beforeAll(async () => {
  for (const dir of dirs) {
    await buildAndServe(dir);
  }
  browser = await puppeteer.launch({ args: ['--no-sandbox'] });
});

beforeEach(async () => {
  page = await browser.newPage();
});

for (const dir of dirs) {
  it(dir, async () => {
    await require(join(fixtures, `${dir}/test`)).default({
      page,
      host: `http://localhost:${servers[dir].port}`,
    });
  });
}

afterAll(() => {
  Object.keys(servers).forEach(name => {
    servers[name].server.close();
  });
  browser.close();
});

async function build(cwd: string, name: string) {
  return new Promise((resolve, reject) => {
    const umiPath = join(__dirname, '../bin/umi.js');
    const env = {
      COMPRESS: 'none',
      PROGRESS: 'none',
    } as any;
    if (name.includes('app_root')) {
      env.APP_ROOT = './root';
    }
    const child = fork(umiPath, ['build'], {
      cwd,
      env,
    });
    child.on('exit', code => {
      if (code === 1) {
        reject(new Error('Build failed'));
      } else {
        resolve();
      }
    });
  });
}

async function buildAndServe(name: string) {
  const cwd = join(fixtures, name);
  const targetDist = name.includes('app_root') ? join(cwd, 'root', 'dist') : join(cwd, 'dist');
  if (!existsSync(targetDist)) {
    await build(cwd, name);
  }
  return new Promise(resolve => {
    port += 1;
    servers[name] = { port };
    servers[name].server = http.createServer((request, response) => {
      return require('serve-static')(targetDist)(request, response);
    });
    servers[name].server.listen(port, () => {
      console.log(`[${name}] Running at http://localhost:${port}`);
      resolve();
    });
  });
}
