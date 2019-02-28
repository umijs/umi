
interface ILibraryConfig {
  esm?: {
    type: 'rollup' | 'babel';
  };
}

export default {
  entry: ['src/index.ts'],
  esm: { type: 'rollup' },
} as ILibraryConfig;
