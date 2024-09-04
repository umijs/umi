import React from 'react';

import { Outlet } from 'umi';

const Layout = () => {
  return (
    <div>
      <div style={{ marginBottom: '10px' }}>HEADER</div>
      <Outlet />
    </div>
  );
};

export default Layout;
