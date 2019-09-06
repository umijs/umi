import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import CacheRoute, { CacheSwitch } from 'react-router-cache-route';

const RouteInstanceMap = {
  get(key) {
    return key._routeInternalComponent;
  },
  has(key) {
    return key._routeInternalComponent !== undefined;
  },
  set(key, value) {
    key._routeInternalComponent = value;
  },
};

// Support pass props from layout to child routes
const RouteWithProps = ({
  path,
  exact,
  strict,
  render,
  location,
  sensitive,
  keepAlive,
  ...rest
}) => {
  if (keepAlive) {
    return (
      <CacheRoute
        when="always"
        cacheKey={path}
        path={path}
        exact={exact}
        strict={strict}
        location={location}
        sensitive={sensitive}
        render={props => render({ ...props, ...rest })}
      />
    );
  }
  return (
    <Route
      path={path}
      exact={exact}
      strict={strict}
      location={location}
      sensitive={sensitive}
      render={props => render({ ...props, ...rest })}
    />
  );
};

function getCompatProps(props) {
  const compatProps = {};
  if (__UMI_BIGFISH_COMPAT) {
    if (props.match && props.match.params && !props.params) {
      compatProps.params = props.match.params;
    }
  }
  return compatProps;
}

function withRoutes(route) {
  if (RouteInstanceMap.has(route)) {
    return RouteInstanceMap.get(route);
  }

  const { Routes } = route;
  let len = Routes.length - 1;
  let Component = args => {
    const { render, ...props } = args;
    return render(props);
  };
  while (len >= 0) {
    const AuthRoute = Routes[len];
    const OldComponent = Component;
    Component = props => (
      <AuthRoute {...props}>
        <OldComponent {...props} />
      </AuthRoute>
    );
    len -= 1;
  }

  const ret = args => {
    const { render, ...rest } = args;
    return (
      <RouteWithProps
        {...rest}
        render={props => {
          return <Component {...props} route={route} render={render} />;
        }}
      />
    );
  };
  RouteInstanceMap.set(route, ret);
  return ret;
}

function wrapWithInitialProps(WrappedComponent, initialProps) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        extraProps: {},
      };
    }

    async componentDidMount() {
      const { history } = this.props;
      window.onpopstate = () => {
        this.getInitialProps();
      };
      if (history.action !== 'POP') {
        this.getInitialProps();
      }
    }

    // 前端路由切换时，也需要执行 getInitialProps
    async getInitialProps() {
      // the values may be different with findRoute.js
      const { match, location } = this.props;
      const extraProps = await WrappedComponent.getInitialProps({
        isServer: false,
        route: match,
        location,
        ...initialProps,
      });
      this.setState({
        extraProps,
      });
    }

    render() {
      const { extraProps } = this.state;
      return (
        <WrappedComponent
          {...{
            ...this.props,
            ...extraProps,
          }}
        />
      );
    }
  };
}

export default function renderRoutes(routes, extraProps = {}, switchProps = {}) {
  const plugins = require('umi/_runtimePlugin');
  return routes ? (
    <CacheSwitch {...switchProps} which={element => element.props.keepAlive}>
      {routes.map((route, i) => {
        if (route.redirect) {
          return (
            <Redirect
              key={route.key || i}
              from={route.path}
              to={route.redirect}
              exact={route.exact}
              strict={route.strict}
            />
          );
        }
        const RouteRoute = route.Routes ? withRoutes(route) : RouteWithProps;
        return (
          <RouteRoute
            key={route.key || i}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
            sensitive={route.sensitive}
            keepAlive={route.keepAlive}
            render={props => {
              const childRoutes = renderRoutes(route.routes, extraProps, {
                location: props.location,
              });
              if (route.component) {
                const compatProps = getCompatProps({
                  ...props,
                  ...extraProps,
                });
                const newProps = plugins.apply('modifyRouteProps', {
                  initialValue: {
                    ...props,
                    ...extraProps,
                    ...compatProps,
                  },
                  args: { route },
                });
                let { component: Component } = route;
                // eslint-disable-next-line no-undef
                if (__IS_BROWSER && Component.getInitialProps) {
                  const initialProps = plugins.apply('modifyInitialProps', {
                    initialValue: {},
                  });
                  Component = wrapWithInitialProps(Component, initialProps);
                }
                return (
                  <Component {...newProps} route={route}>
                    {childRoutes}
                  </Component>
                );
              } else {
                return childRoutes;
              }
            }}
          />
        );
      })}
    </CacheSwitch>
  ) : null;
}
