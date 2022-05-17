import React from 'react';
import { Link, Outlet } from 'umi';

export default () => {
  return (
    <div>
      <ul>
        <li>
          <Link to="/with_client_loader/foo/bar">/with_client_loader</Link>
        </li>
        <li>
          <Link to="/without_client_loader/foo/bar">
            /without_client_loader
          </Link>
        </li>
      </ul>
      <Outlet />
    </div>
  );
};
