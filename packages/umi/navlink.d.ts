import * as React from 'react';

declare class NavLink extends React.Component<{
  to: string | {
    pathname: string,
    search: string,
    hash: string,
    state: any,
  },
  replace?: boolean,
  innerRef?: Function,
  title?: string,
  id?: string,
  className?: string,
  activeClassName?: string,
  activeStyle?: object,
  exact?: boolean,
  strict?: boolean,
  isActive?: Function,
  location?: object,
}, any> {
  render(): JSX.Element;
}
export default NavLink;
