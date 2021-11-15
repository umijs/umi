import React from 'react';
import { Link, Outlet } from 'umi';

export default function () {
  return (
    <div>
      <h1>layout</h1>
      <ul>
        <li>
          <Link to="/">Home</Link>
          <Link to="/welcome">Welcome</Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
}
