import React from 'react';
// @ts-ignore
import { Link, Outlet } from 'umi';

export default function Layout() {
  return (
    <div>
      <h2>Welcome to umi!</h2>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
        <li>
          <Link to="https://github.com/umijs/umi">Github</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
