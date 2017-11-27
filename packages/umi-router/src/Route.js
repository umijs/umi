import React, { Component } from 'react';
import PropTypes from 'prop-types';
import querystring from 'query-string';

class Router extends Component {
  static contextTypes = {
    router: PropTypes.shape({
      history: PropTypes.object.isRequired,
      route: PropTypes.object.isRequired,
    }),
  };

  static childContextTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      match: props.computedMatch,
    };
  }

  getChildContext() {
    return {
      router: {
        ...this.context.router,
        route: {
          location: this.props.location || this.context.router.route.location,
          match: this.state.match,
        },
      },
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      match: nextProps.computedMatch,
    });
  }

  render() {
    const { match } = this.state;
    const { component } = this.props;
    const props = {
      match,
      location: this.props.location,
      history: this.context.router.history,
    };

    props.location.query = querystring.parse(props.location.search);
    return match ? React.createElement(component, props) : null;
  }
}

export default Router;
