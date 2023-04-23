import hoistStatics from 'hoist-non-react-statics';
import React from 'react';
import { useLocation } from 'umi';

// ref:
// https://github.com/remix-run/react-router/blob/v5/packages/react-router/modules/withRouter.js
export function withRouter(Component: any) {
  const displayName = `withRouter(${Component.displayName || Component.name})`;
  const C = (props: any) => {
    const location = useLocation();
    // TODO:
    // YOU CAN ADD MORE PROPS HERE
    const moreProps = {
      location,
    };
    return <Component {...props} {...moreProps} />;
  };
  C.displayName = displayName;
  C.WrappedComponent = Component;
  return hoistStatics(C, Component);
}
