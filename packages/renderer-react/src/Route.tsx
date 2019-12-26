import React from 'react';
import { matchPath, __RouterContext as RouterContext } from '@umijs/runtime';

export default function Route(props: any) {
  return (
    <RouterContext.Consumer>
      {(context: any) => {
        if (!context) {
          throw new Error('You should not use <Switch> outside a <Router>');
        }

        const { location } = context;
        const match = props.computedMatch
          ? props.computedMatch // <Switch> already computed the match for us
          : props.path
          ? matchPath(location.pathname, props)
          : context.match;

        const newProps = { ...context, location, match };
        let { render } = props;

        return (
          <RouterContext.Provider value={newProps}>
            {newProps.match
              ? render({
                  ...props.layoutProps,
                  ...newProps,
                })
              : null}
          </RouterContext.Provider>
        );
      }}
    </RouterContext.Consumer>
  );
}
