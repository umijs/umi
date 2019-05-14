import * as React from 'react';

declare const dynamic: (
  opts: {
    loader?: Function;
    render?: Function;
    loading?: React.Component | (() => null);
    delay?: number | false | null;
    timeout?: number | false | null;
    webpack?: () => number[];
  },
) => React.Component;

export default dynamic;
