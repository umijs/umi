import React, { Component } from 'react';

class Compiling extends Component {
  componentDidMount() {
    new Image().src = `${window.resourceBaseUrl ||
      window.publicPath}__umi_dev/compiling${this.props.route}`;
  }
  render() {
    return <div>Compiling...</div>;
  }
}

export default Compiling;
