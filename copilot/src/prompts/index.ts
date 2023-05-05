import build from './build';
import commands from './commands';
import config from './config';
import dev from './dev';
import generate from './generate';

const prompts: Record<string, string> = {
  commands,
  dev,
  build,
  generate,
  config,
};

export default prompts;
