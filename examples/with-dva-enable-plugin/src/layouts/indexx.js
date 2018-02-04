import { Component } from 'react';
import createSharedDva from '../createSharedDva';

const app = createSharedDva();
app.model(require('../models/global').default);

class Layout extends Component {
  render() {
    app.router(() => this.props.children);
    return app.start()();
  }
}

export default Layout;
