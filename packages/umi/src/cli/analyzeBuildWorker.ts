import { checkLocal, logger, setNoDeprecation } from '@umijs/utils';
import { Service } from '../service/service';

process.once('message', async (args: Record<string, unknown>) => {
  try {
    checkLocal();
    setNoDeprecation();
    const reportPath = await new Service().run2({ name: 'build', args });
    process.send?.({ reportPath });
  } catch (error) {
    logger.error(error);
    process.exitCode = 1;
  } finally {
    process.disconnect?.();
  }
});
