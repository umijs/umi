import { chalk } from '../index';

export function feedback() {
  // don't print feedback in bigfish framework
  if (process.env.BIGFISH_VERSION) return;
  if (process.env.FB_TIPS === 'none') return;
  console.info(
    chalk.black.bgGreen.bold(' info '),
    chalk.green.bold('如果你需要进交流群，请访问 https://fb.umijs.org'),
  );
}
