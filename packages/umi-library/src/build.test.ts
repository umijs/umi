import { join } from 'path';
import build from './build';

describe('umi-library build', () => {
  require('test-build-result')({
    root: join(__dirname, './fixtures/build'),
    build({ cwd }) {
      return build({ cwd });
    },
  });
});
