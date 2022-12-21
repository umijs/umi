import React from 'react';
import { Outlet, history } from '@umijs/max';

export default function Nest() {
  return (
    <div style={{ marginLeft: 20 }}>
      nest:
      <Outlet />
    </div>
  );
}
