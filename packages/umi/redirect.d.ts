import * as React from 'react';

declare class Redirect extends React.Component<{
  to: string | {
    pathname: string,
    search: string,
    hash: string,
    state: any,
  },
  push?: boolean,
  from?: string,
  exact?: boolean,
  strict?: boolean,
}, any> {
  render(): JSX.Element;
}
export default Redirect;
