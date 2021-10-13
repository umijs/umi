import { BrowserHistory, createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';

export function Browser(props: { routes: any[] }) {
  const historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current === null) {
    historyRef.current = createBrowserHistory({ window });
  }
  const history = historyRef.current;
  return <App navigator={history!} routes={props.routes} />;
}

export function renderClient(opts: {
  rootElement?: HTMLElement;
  routes?: any[];
}) {
  // @ts-ignore
  const root = ReactDOM.createRoot(
    opts.rootElement || document.getElementById('root'),
  );
  root.render(<Browser routes={opts.routes || []} />);
}
