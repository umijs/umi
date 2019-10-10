import fork from 'umi-build-dev/lib/fork';
import yParser from 'yargs-parser';
import UmiUI from 'umi-ui/lib/UmiUI';
import buildDevOpts from '../buildDevOpts';
import isUmiUIEnable from '../isUmiUIEnable';

(async () => {
  const args = yParser(process.argv.slice(2));
  const opts = buildDevOpts(args);

  let umiui;

  // Start umi ui
  const { cwd } = opts;
  const enableUmiUI =
    process.env.UMI_UI === '1' || (process.env.UMI_UI !== 'none' && isUmiUIEnable(cwd));
  if (process.env.UMI_UI_SERVER !== 'none' && enableUmiUI) {
    process.env.UMI_UI_BROWSER = 'none';
    umiui = new UmiUI();
    const { port } = await umiui.start();
    process.env.UMI_UI_PORT = port;
  }
  if (!enableUmiUI) {
    process.env.UMI_UI = 'none';
  }

  function killUmiUI() {
    if (umiui && umiui.server) {
      umiui.server.close();
    }
  }

  // Start real umi dev
  const child = fork(require.resolve('./realDev.js'), {
    onMessage(data) {
      const { type } = data;
      if (type && type.startsWith('org.umi.ui.bubble') && global.g_send) {
        global.g_send({ type, payload: { projectPath: cwd } });
      }
    },
  });
  child.on('exit', code => {
    if (code === 1) {
      process.exit(1);
    }
  });

  child.on('message', data => {
    if (process.send) {
      process.send(data);
    }
  });

  process.on('SIGTERM', () => {
    child.kill('SIGTERM');
    killUmiUI();
    process.exit();
  });

  process.on('SIGINT', () => {
    child.kill('SIGINT');
    killUmiUI();
    process.exit();
  });
})();
