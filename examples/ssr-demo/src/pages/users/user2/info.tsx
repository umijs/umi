import React from 'react';
import { useClientLoaderData, useServerLoaderData } from 'umi';

export default () => {
  const clientLoaderData = useClientLoaderData();
  const serverLoaderData = useServerLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>Info</h1>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <p>server loader data: {JSON.stringify(serverLoaderData)}</p>
    </div>
  );
};

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user2/info.tsx' };
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of users/user2/info.tsx' };
}
