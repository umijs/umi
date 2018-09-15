import yParser from 'yargs-parser';
import { join } from 'path';
import fs, { renameSync, readdirSync, statSync, access } from 'fs';
import { copy, ensureDir } from 'fs-extra';
import child_process from 'child_process';
import buildDevOpts from '../buildDevOpts';
let closed = false;

// kill(2) Ctrl-C
process.once('SIGINT', () => onSignal('SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', () => onSignal('SIGQUIT'));
// kill(15) default
process.once('SIGTERM', () => onSignal('SIGTERM'));

function onSignal(signal) {
  if (closed) return;
  closed = true;
  process.exit(0);
}

function fileWalk(path, cb) {
  const pa = readdirSync(path);
  pa.forEach(name => {
    const info = statSync(`${path}/${name}`);
    if (info.isDirectory()) {
      fileWalk(`${path}/${name}`, cb);
    } else {
      cb(`${path}/${name}`);
    }
  });
}

const uiCwd = join(
  __dirname,
  '../../node_modules/umi-build-dev/lib/plugins/commands/ui/view',
);

ensureDir(join(process.cwd(), 'pages/.umi/dashboard'), () => {
  copy(uiCwd, join(process.cwd(), 'pages/.umi/dashboard'), err => {
    fileWalk(join(process.cwd(), 'pages/.umi/dashboard'), filePath => {
      if (filePath.endsWith('umirc.js.less')) {
        renameSync(filePath, filePath.replace('umirc.js.less', '.umirc.js'));
      }

      if (
        (filePath.endsWith('.js.less') || filePath.endsWith('.json.less')) &&
        !filePath.endsWith('umirc.js.less')
      ) {
        renameSync(filePath, filePath.slice(0, -5));
      }
    });

    child_process.execSync('yarn install', {
      cwd: join(process.cwd(), 'pages/.umi/dashboard'),
    });
    process.env.NODE_ENV = 'development';
    const args = yParser(process.argv.slice(2));
    const Service = require('umi-build-dev/lib/Service').default;
    new Service(
      buildDevOpts({ cwd: join(process.cwd(), 'pages/.umi/dashboard') }),
    ).run('ui', args);
  });
});
