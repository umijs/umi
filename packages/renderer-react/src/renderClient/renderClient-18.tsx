// @ts-ignore
import ReactDOM from 'react-dom/client';
import getRootContainer from './getRootContainer';
import type { IOpts } from './types';

export default function renderClient(opts: IOpts) {
  const rootContainer = getRootContainer(opts);

  if (opts.rootElement) {
    const rootElement =
      typeof opts.rootElement === 'string'
        ? document.getElementById(opts.rootElement)
        : opts.rootElement;
    const callback = opts.callback || (() => {});

    // flag showing SSR succeed
    if (window.g_useSSR) {
      ReactDOM.hydrateRoot(rootElement, rootContainer);
      callback();
    } else {
      const root = ReactDOM.createRoot(rootElement);
      root.render(rootContainer);
      callback();
    }
  } else {
    return rootContainer;
  }
}
