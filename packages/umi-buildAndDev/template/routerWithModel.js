import { Router, Route, Switch } from 'umi-router';
import dynamic from 'koi/dynamic';
import { Provider, AppModel } from '@alipay/twa-model';

import app from './model';
import './rpc';

export default function KoiRouter(store) {
  return (
    <Provider store={app}>
  <%= routeComponents %>
    </Provider>
  );
}
