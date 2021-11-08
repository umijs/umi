import { join } from 'path';
export default {
  alias: {
    react: require.resolve('./react.ts'),
    some: join(__dirname,'some'),
  },
};
