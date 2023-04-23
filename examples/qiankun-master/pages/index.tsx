import React, { useState } from 'react';
// @ts-ignore
import { Link, MicroAppWithMemoHistory } from '@umijs/max';
// @ts-ignore
import { Drawer } from 'antd';

export default function HomePage() {
  return (
    <div>
      <h2>Qiankun Master Page</h2>

      <div>
        <Link to="/slave/home">
          <button>go-slave</button>
        </Link>
      </div>
    </div>
  );
}
