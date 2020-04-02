import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

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
const RouteWithProps = ({ path, exact, strict, render, location, sensitive, ...rest }) => (
  <Route
    path={path}
    exact={exact}
    strict={strict}
    location={location}
    sensitive={sensitive}
    render={props => render({ ...props, ...rest })}
  />
);

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

/**
 * A flag indicating the route changed or not
 */
let routeChanged = false;

function wrapWithInitialProps(WrappedComponent, initialProps, extraProps = {}) {
  return class SSRComponent extends React.Component {
    // A const static value marking itself as wrapped
    wrappedWithInitialProps = true;

    constructor(props) {
      super(props);
      this.state = {
        extraProps: { ...extraProps },
      };
      if (!routeChanged) {
        routeChanged = !window.g_useSSR || (props.history && props.history.action !== 'POP');
      }
    }

    async componentDidMount() {
      if (routeChanged) {
        this.getInitialProps();
      }
    }

    componentDidUpdate(prevProps) {
      const { location } = this.props;
      // check if pathname changed,
      // to catch potential case of routes reusing the same page instance
      // TODO: also check location.search?
      if (prevProps.location.pathname !== location.pathname) {
        routeChanged = true;
        this.getInitialProps();
      }
    }

    componentWillUnmount() {
      // Catch the case of navigating back to the root layout
      routeChanged = true;
    }

    // 前端路由切换时，也需要执行 getInitialProps
    async getInitialProps() {
      // the values may be different with findRoute.js
      const { match, location } = this.props;
      const { extraProps } = this.state;
      this.setState({
        extraProps: { ...extraProps, fetchingProps: true },
      });
      const nextExtraProps =
        (await WrappedComponent.getInitialProps({
          isServer: false,
          route: match,
          location,
          // provide a copy of previous initialProps for quick reuse
          prevInitialProps: extraProps,
          ...initialProps,
        })) || {};
      nextExtraProps.fetchingProps = false;
      this.setState({
        extraProps: nextExtraProps,
      });
    }

    render() {
      return (
        <WrappedComponent
          {...{
            ...this.props,
            ...this.state.extraProps,
          }}
        />
      );
    }
  };
}

export default function renderRoutes(routes, extraProps = {}, switchProps = {}) {
  const plugins = require('umi/_runtimePlugin');
  return routes ? (
    <Switch {...switchProps}>
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
            render={props => {
              const { location } = props;
              // Drop expired SSR init props
              // (SSR initial props are only valid before user navigation)
              if (routeChanged) extraProps = {};
              // TODO: ssr StaticRoute context hook, handle 40x / 30x
              const childRoutes = renderRoutes(route.routes, extraProps, {
                location,
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
                if (__IS_BROWSER && Component.getInitialProps) {
                  const initialProps = plugins.apply('modifyInitialProps', {
                    initialValue: {},
                  });
                  if (!Component.wrappedWithInitialProps) {
                    // ensure the component is wrapped only once
                    Component = wrapWithInitialProps(Component, initialProps, extraProps);
                    // replace the original component in the route
                    route.component = Component;
                  }
                }
                return (
                  // reuse component for the same umi path (could be dynamic)
                  <Component key={route.path} {...newProps} route={route}>
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
    </Switch>
  ) : null;
}
