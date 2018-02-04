import { Component } from 'react';
import dva from 'dva';
import createLoading from 'dva-loading';

const app = dva();
app.use(createLoading());
<%= RegisterPlugins %>
<%= RegisterModels %>

class DvaContainer extends Component {
  render() {
    app.router(() => this.props.children);
    return app.start()();
  }
}

export default DvaContainer;
