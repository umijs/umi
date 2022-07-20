import React from 'react';
// @ts-ignore
import { Link, Outlet } from 'umi';

export default function Layouts() {
  return (
    <div>
      <h1>App2</h1>
      <ul>
        <li>
          <Link to="/">HomePage</Link>
        </li>
        <li>
          <Link to="/hello">Hello</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
