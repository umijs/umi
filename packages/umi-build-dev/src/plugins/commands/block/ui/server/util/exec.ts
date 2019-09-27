import execa from 'execa';
import Logger from '../core/Logger';

const execaWithLogger = (logger: Logger, setRef) => async (...args) => {
  const proc = execa(...args);
  setRef(proc);
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
