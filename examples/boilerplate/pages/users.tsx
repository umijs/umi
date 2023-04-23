import React from 'react';
// @ts-ignore
import { Outlet } from 'umi';

export default () => {
  return (
    <div>
      <h2>users layout</h2>
      <Outlet />
    </div>
  );
};
