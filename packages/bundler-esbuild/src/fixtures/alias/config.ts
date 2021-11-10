import { join } from 'path';

export default {
  alias: {
    foo: './path/foo',
    dir: join(__dirname, 'path', 'dir'),
    less$: join(__dirname, 'path', 'less'),
  },
};
