import { Outlet } from '@umijs/max';
import React from 'react';
import { KeepAliveContainer } from '../components/KeepAliveContainer';
import { name } from '../package.json';

/** Route wrapper: cache the matched page via KeepAliveContainer. */
export default function KeepAlive() {
  return (
    <KeepAliveContainer appName={name}>
      <Outlet />
    </KeepAliveContainer>
  );
}
