import yParser from 'yargs-parser';
import UmiUI from 'umi-ui/lib/UmiUI';
import buildDevOpts from '../buildDevOpts';

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
  if (process.env.UMI_UI !== 'none') {
    process.env.UMI_UI_BROWSER = 'none';
    const umiui = new UmiUI();
    const { port } = await umiui.start();
    process.env.UMI_UI_PORT = port;
  }

  // Start origin umi dev
  process.env.NODE_ENV = 'development';
  const args = yParser(process.argv.slice(2));
  // Service 的引入不能用 import，因为有些要依赖 development 这个 NODE_ENV
  const Service = require('umi-build-dev/lib/Service').default;
  new Service(buildDevOpts(args)).run('dev', args);
})();
