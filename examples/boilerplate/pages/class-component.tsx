import React from 'react';
import { withRouter } from '../withRouter';

class CC extends React.Component {
  render() {
    // @ts-ignore
    return <div>Hello World {this.props.location.pathname}</div>;
  }
}

export default withRouter(CC);
