import { chalk } from '../index';

export function feedback() {
  console.info(
    chalk.black.bgGreen.bold(' info '),
    chalk.green.bold('如果你需要进交流群，请访问 https://fb.umijs.org'),
  );
}
