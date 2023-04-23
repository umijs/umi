import React from 'react';
import { withRouter } from 'umi';

class CC extends React.Component<any> {
  render() {
    // @ts-ignore
    return (
      <div>
        Hello World {this.props.location.pathname}
        <h2>params: {JSON.stringify(this.props.match.params)}</h2>
        <button
          onClick={() => {
            this.props.history.push('/users');
          }}
        >
          To Users
        </button>
      </div>
    );
  }
}

export default withRouter(CC);
