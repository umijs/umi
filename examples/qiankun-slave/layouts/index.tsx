import React from 'react';
import { Link, Outlet } from 'umi';

export default function Layouts() {
  return (
    <div>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/app1">app1</Link>
        </li>
        {/*<li>*/}
        {/*  <Link to="/users">users</Link>*/}
        {/*</li>*/}
        {/*<li>*/}
        {/*  <Link to="/users2">users2</Link>*/}
        {/*</li>*/}
      </ul>
      <Outlet />
    </div>
  );
}
