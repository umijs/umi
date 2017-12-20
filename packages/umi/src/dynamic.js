import React, { Component } from 'react';

export default function(config) {
  config = typeof config === 'function' ? { resolve: config } : config;
  const { resolve, LoadingComponent = () => null } = config;

  return class DynamicComponent extends Component {
    constructor(...args) {
      super(...args);
      this.LoadingComponent = LoadingComponent;
      this.state = {
        AsyncComponent: null,
      };
      this.load();
    }

    componentDidMount() {
      this.mounted = true;
    }

    componentWillUnmount() {
      this.mounted = false;
    }

    load() {
      resolve().then(m => {
        const AsyncComponent = m.default || m;
        if (this.mounted) {
          this.setState({ AsyncComponent });
        } else {
          this.state.AsyncComponent = AsyncComponent; // eslint-disable-line
        }
      });
    }

    render() {
      const { AsyncComponent } = this.state;
      const { LoadingComponent } = this;
      if (AsyncComponent) return <AsyncComponent {...this.props} />;

      return <LoadingComponent {...this.props} />;
    }
  };
}
