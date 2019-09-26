import yParser from 'yargs-parser';
import UmiUI from 'umi-ui/lib/UmiUI';
import buildDevOpts from '../buildDevOpts';
import isUmiUIEnable from '../isUmiUIEnable';

let closed = false;

// kill(2) Ctrl-C
process.once('SIGINT', () => onSignal('SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', () => onSignal('SIGQUIT'));
// kill(15) default
process.once('SIGTERM', () => onSignal('SIGTERM'));

function onSignal() {
  if (closed) return;
  closed = true;
  process.exit(0);
}

(async () => {
  // Start umi ui
  const cwd = process.cwd();
  const enableUmiUI = process.env.UMI_UI || (process.env.UMI_UI !== 'none' && isUmiUIEnable(cwd));
  if (process.env.UMI_UI_SERVER !== 'none' && enableUmiUI) {
    process.env.UMI_UI_BROWSER = 'none';
    const umiui = new UmiUI();
    const { port } = await umiui.start();
    process.env.UMI_UI_PORT = port;
  }
  if (!enableUmiUI) {
    process.env.UMI_UI = 'none';
  }

  // Start origin umi dev
  process.env.NODE_ENV = 'development';
  const args = yParser(process.argv.slice(2));
  // Service 的引入不能用 import，因为有些要依赖 development 这个 NODE_ENV
  const Service = require('umi-build-dev/lib/Service').default;
  new Service(buildDevOpts(args)).run('dev', args);
})();
