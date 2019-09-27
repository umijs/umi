import execa from 'execa';
import Logger from '../core/Logger';

const execaWithLogger = (logger: Logger) => async (...args) => {
  const proc = execa(...args);
  proc.stdout.pipe(
    logger.ws,
    {
      end: false,
    },
  );
  proc.stderr.pipe(
    logger.ws,
    {
      end: false,
    },
  );
  return proc;
};

export default execaWithLogger;
