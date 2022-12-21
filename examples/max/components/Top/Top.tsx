import React from 'react';
import { history, Outlet } from '@umijs/max';
export default function Top() {
  return (
    <div>
      <div>
        <button
          onClick={() => {
            history.push('../');
          }}
        >
          go up
        </button>
      </div>
      <div style={{ marginLeft: 20 }}>
        nest:
        <Outlet />
      </div>
    </div>
  );
}
