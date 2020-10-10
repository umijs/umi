import React from 'react';
import { __RouterContext as RouterContext, matchPath } from '@umijs/runtime';

export default function Switch(props: any) {
  return (
    <RouterContext.Consumer>
      {(context: any) => {
        const { children, ...extraProps } = props;
        const { location } = context;
        let element: any,
          match: object | null = null;

        React.Children.forEach(
          children,
          (child: { props: { path: string; from: string } }) => {
            if (match === null && React.isValidElement(child)) {
              element = child;
              const path = child.props.path || child.props.from;
              match = path
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;
            }
          },
        );

        return match
          ? React.cloneElement(element, {
              location,
              computedMatch: match,
              layoutProps: extraProps,
            })
          : null;
      }}
    </RouterContext.Consumer>
  );
}
