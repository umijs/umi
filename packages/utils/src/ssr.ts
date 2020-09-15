/**
 * whether in browser env
 */
export const isBrowser = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined';

/**
 * get window.g_initialProps
 */
export const getWindowInitialProps = () =>
  isBrowser() ? (window as any).g_initialProps : undefined;

/**
 * whether SSR success in client
 */
export const isSSR = () => isBrowser() && (window as any).g_useSSR;
