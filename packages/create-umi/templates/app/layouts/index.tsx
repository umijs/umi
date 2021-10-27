import React from 'react';
import { Link, Outlet } from 'umi';

export default function Layout() {
  return (
    <div>
      <h2>global layout</h2>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/users">/users</Link>
        </li>
        <li>
          <Link to="/users/foo">/users/foo</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
