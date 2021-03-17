import assert from './assert';

export { assert };

/**
 * whether in browser env
 */
export const isBrowser = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';
