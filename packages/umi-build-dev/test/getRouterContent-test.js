import expect from 'expect';
import getRouterContent from '../src/getRouterContent';

xdescribe('getRouterContent', () => {
  it('normal', () => {
    const content = getRouterContent({
      '/detail.html': 'detail/page.js',
      '/index.html': 'index.js',
      '/users/list.html': 'users/list.js',
    });
    expect(content.trim()).toEqual(
      `
import { Router, Route, Switch } from 'umi-router';
import dynamic from 'koi/dynamic';

export default function KoiRouter() {
  return (
<Router history={window.g_history}>
  <Switch>
    <Route exact path="/detail.html" component={dynamic(() => import(/* webpackChunkName: 'detail__page' */'../detail/page.js'))}></Route>
    <Route exact path="/index.html" component={dynamic(() => import(/* webpackChunkName: 'index' */'../index.js'))}></Route>
    <Route exact path="/users/list.html" component={dynamic(() => import(/* webpackChunkName: 'users__list' */'../users/list.js'))}></Route>
    <Route exact path="/" component={dynamic(() => import(/* webpackChunkName: 'index' */'../index.js'))}></Route>
  </Switch>
</Router>
  );
}
`.trim(),
    );
  });
});
