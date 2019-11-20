import React from 'react';
import propTypes from 'prop-types';

export default class extends React.Component {
  static contextTypes = {
    router: propTypes.object,
  }
  render() {
    const { route } = this.context.router;
    return (
      <>
        <h1>{route.location.pathname}</h1>
      </>
    )
  }
}
