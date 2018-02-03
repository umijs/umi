import { Component } from 'react';
import dva from 'dva';

const app = dva();
<%= RegisterPlugins %>
<%= RegisterModels %>

class DvaContainer extends Component {
  render() {
    const props = this.props;
    app.router(() => {
      return <div>{ props.children }</div>;
    });
    return app.start();
  }
}

export default DvaContainer;
