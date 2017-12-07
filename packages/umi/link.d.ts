import * as React from 'react';

declare class Link extends React.Component<{
  to: string,
  replace?: boolean,
}, any> {
  render(): JSX.Element;
}
export default Link;
