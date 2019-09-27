import execa from 'execa';
import Logger from '../core/Logger';

const execaWithLogger = (logger: Logger) => async (...args) => {
  const { stdout, stderr } = await execa(...args);
  logger.appendLog(stdout);
  logger.appendLog(stderr);
};

export default execaWithLogger;
