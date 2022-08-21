import type { ResolvedOptions, UserOptions } from './type';

export function resolveOptions(userOptions: UserOptions): ResolvedOptions {
  return {
    format: 'cjs',
    target: 'es2019',
    sourcemap: true,
    ...userOptions,
  };
}
