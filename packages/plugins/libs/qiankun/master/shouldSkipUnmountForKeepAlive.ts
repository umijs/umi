/**
 * Whether to skip qiankun unmount (for unit tests; MicroApp.tsx inlines the same logic
 * so generated .umi code needs no extra import).
 * Returns true only for keepAlive (autoUnmount === false) when the container is still
 * in the document and name did not change.
 */
export function shouldSkipUnmountForKeepAlive(opts: {
  autoUnmount?: boolean;
  containerStillInDocument: boolean;
  microAppReplaced: boolean;
}): boolean {
  if (opts.autoUnmount !== false) return false;
  if (opts.microAppReplaced) return false;
  return opts.containerStillInDocument;
}
