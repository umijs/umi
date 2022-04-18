// @ts-ignore
import ReactDOM from 'react-dom-18/client';
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

    const finalRootElement: HTMLElement =
      rootElement || document.createElement('div');

    if (!finalRootElement.id) {
      finalRootElement.id =
        typeof opts.rootElement === 'string' ? opts.rootElement : 'root';
    }

    // flag showing SSR successed
    if (window.g_useSSR) {
      ReactDOM.hydrateRoot(finalRootElement, rootContainer);
      callback();
    } else {
      const root = ReactDOM.createRoot(finalRootElement);
      root.render(rootContainer);
      callback();
    }
  } else {
    return rootContainer;
  }
}
