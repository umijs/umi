import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Router extends Component {
  static childContextTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = {
      match: {},
    };
  }

  getChildContext() {
    return {
      router: {
        ...this.context.router,
        history: this.props.history,
        route: {
          location: this.props.history.location,
          match: this.state.match,
        },
      },
    };
  }

  componentWillMount() {
    const { history } = this.props;
    this.unlisten = history.listen(() => {
      this.setState({
        match: {},
      });
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    const { children } = this.props;
    return children ? React.Children.only(children) : null;
  }
}

export default Router;
