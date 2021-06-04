import { matchPath, __RouterContext as RouterContext } from '@umijs/runtime';
import React, { Children, cloneElement, isValidElement } from 'react';

export default function Switch(props: any) {
  return (
    <RouterContext.Consumer>
      {(context: any) => {
        const { children, ...extraProps } = props;
        const location = props.location || context.location;
        let element: any,
          match: object | null = null;

        Children.forEach(
          children,
          (child: { props: { path: string; from: string } }) => {
            if (match === null && isValidElement(child)) {
              element = child;
              const path = child.props.path || child.props.from;
              match = path
                ? matchPath(location.pathname, { ...child.props, path })
                : context.match;
            }
          },
        );

        return match
          ? cloneElement(element, {
              location,
              computedMatch: match,
              layoutProps: extraProps,
            })
          : null;
      }}
    </RouterContext.Consumer>
  );
}
