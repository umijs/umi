import * as React from 'react';

declare class Link extends React.Component<{
  to: string | {
    pathname: string,
    search?: string,
    hash?: string,
    state?: any,
  },
  replace?: boolean,
  innerRef?: Function,
  title?: string,
  id?: string,
  className?: string,
}, any> {
  render(): JSX.Element;
}
export default Link;
