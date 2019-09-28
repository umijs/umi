import execa from 'execa';
import Logger from '../core/Logger';

const execaWithLogger = (logger: Logger, setRef) => async (...args) => {
  const execArgs = [...args];
  execArgs[2] = {
    ...execArgs[2],
    buffer: false,
  };
  const proc = execa(...execArgs);
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
