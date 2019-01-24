import Service from 'umi-build-dev/lib/Service';
import { join } from 'path';

process.env.COMPRESS = 'none';
process.env.PROGRESS = 'none';
process.env.__FROM_UMI_TEST = true;
process.env.UMI_TEST = true;
process.env.UMI_DIR = join(__dirname, '..');

function build({ cwd, args = {} }) {
  const s = new Service({
    cwd,
  });
  return s.run('build', args);
}

describe('umi build', () => {
  require('test-build-result')({
    root: join(__dirname, './fixtures/build'),
    build({ cwd }) {
      return build({ cwd });
    },
  });
});
