import { warnOnce } from './utils/index.mjs';

export function run() {
  if (process.env.NODE_ENV !== 'production') {
    warnOnce(false, 'development warning');
  }
  console.log('run');
}
