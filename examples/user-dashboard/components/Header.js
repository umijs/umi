import React from 'react';
import { Menu, Icon } from 'antd';
import Link from 'umi/link';

function Header({ location }) {
  return (
    <Menu selectedKeys={[location.pathname]} mode="horizontal" theme="dark">
      <Menu.Item key="/users">
        <Link to="/users">
          <span>
            <Icon type="bars" />Users
          </span>
        </Link>
      </Menu.Item>
      <Menu.Item key="/">
        <Link to="/">
          <span>
            <Icon type="home" />Home
          </span>
        </Link>
      </Menu.Item>
      <Menu.Item key="/404">
        <Link to="/page-you-dont-know">
          <span>
            <Icon type="frown-circle" />404
          </span>
        </Link>
      </Menu.Item>
      <Menu.Item key="/antd">
        <a href="https://github.com/dvajs/dva">dva</a>
      </Menu.Item>
    </Menu>
  );
}

export default Header;
