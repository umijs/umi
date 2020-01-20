import { chalk, yParser } from '@umijs/utils';
import { Service } from './ServiceWithBuiltIn';
import getCwd from './utils/getCwd';

const args = yParser(process.argv.slice(2));

(async () => {
  try {
    process.env.NODE_ENV = 'development';
    const service = new Service({
      cwd: getCwd(),
    });
    await service.run({
      name: 'dev',
      args,
    });
  } catch (e) {
    console.error(chalk.red(e.message));
    console.error(e.stack);
    process.exit(1);
  }
})();
