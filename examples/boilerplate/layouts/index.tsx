import { Outlet } from '@umijs/renderer-react';
import React from 'react';

export default () => {
  return (
    <div>
      <h2>global layout</h2>
      <Outlet />
    </div>
  );
};
