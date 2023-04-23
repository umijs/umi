import React from 'react';
import { Outlet, useClientLoaderData, useServerLoaderData } from 'umi';
import Button from '../../components/Button';

export default () => {
  const clientLoaderData = useClientLoaderData();
  const serverLoaderData = useServerLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>User2 data</h1>
      <Button />
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <p>server loader data: {JSON.stringify(serverLoaderData)}</p>
      <Outlet />
    </div>
  );
};

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user2.tsx' };
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of users/user2.tsx' };
}
