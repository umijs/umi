import React, { Component } from 'react';
import PropTypes from 'prop-types';
import matchPath from './matchPath';

class Router extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      route: PropTypes.object.isRequired,
    }).isRequired,
  };

  componentWillMount() {
    if (!this.context.router) {
      throw new Error('You should not use <Switch> outside a <Router>');
    }
  }

  render() {
    const { route } = this.context.router;
    const { children } = this.props;
    const location = this.props.location || route.location;

    let match = null;
    let child;

    React.Children.forEach(children, element => {
      if (!React.isValidElement(element)) return;

      const { path: pathProp, exact, strict, sensitive, from } = element.props;
      const path = pathProp || from;

      if (match === null) {
        child = element;
        match = matchPath(location.pathname, {
          path,
          exact,
          strict,
          sensitive,
        });
      }
    });

    return match
      ? React.cloneElement(child, { location, computedMatch: match })
      : null;
  }
}

export default Router;
