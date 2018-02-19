import React, { Component } from 'react';

export default function(resolve, opts = {}) {
  const { loading: LoadingComponent = () => null, hoc = C => C } = opts;

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
      resolve()
        .then(m => {
          const AsyncComponent = m.default || m;
          if (this.mounted) {
            this.setState({ AsyncComponent });
          } else {
            this.state.AsyncComponent = AsyncComponent; // eslint-disable-line
          }
        })
        .catch(() => {});
    }

    render() {
      const { LoadingComponent, state: { AsyncComponent } } = this;

      if (AsyncComponent) {
        const Component = hoc(AsyncComponent);
        return <Component {...this.props} />;
      } else {
        return <LoadingComponent {...this.props} />;
      }
    }
  };
}
