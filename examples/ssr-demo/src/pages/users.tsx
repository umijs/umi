import React from 'react';
import { Link, Outlet, useClientLoaderData, useServerLoaderData } from 'umi';

export default () => {
  const clientLoaderData = useClientLoaderData();
  const serverLoaderData = useServerLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <Link to="/">Go back</Link>
      <h1>Users layout</h1>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <p>server loader data: {JSON.stringify(serverLoaderData)}</p>
      <Link to="/users/user">/users/user</Link>
      <Link to="/users/user2">/users/user2</Link>
      <Outlet />
    </div>
  );
};

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users.tsx' };
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of users.tsx' };
}
