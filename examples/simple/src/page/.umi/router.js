import { Router, Route, Switch } from 'umi-router';
import dynamic from 'umi/dynamic';

export default function KoiRouter() {
  return (
    <Router history={window.g_history}>
      <Switch>
        <Route
          exact
          path="/index.html"
          component={require('../index.js').default}
        />
        <Route
          exact
          path="/list.html"
          component={require('../list.js').default}
        />
        <Route exact path="/" component={require('../index.js').default} />
      </Switch>
    </Router>
  );
}
