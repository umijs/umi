import { Component } from 'react';

class DvaContainer extends Component {
  render() {
    window.g_app.router(() => this.props.children);
    return window.g_app.start()();
  }
}

export default DvaContainer;
