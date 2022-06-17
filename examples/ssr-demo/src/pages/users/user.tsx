import React from 'react';
import { useClientLoaderData, useServerLoaderData } from 'umi';
// @ts-ignore
import bigImage from './big_image.jpg';

export default () => {
  const clientLoaderData = useClientLoaderData();
  const serverLoaderData = useServerLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>User data</h1>
      <img src={bigImage} alt="big image" />
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <p>server loader data: {JSON.stringify(serverLoaderData)}</p>
    </div>
  );
};

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user.tsx' };
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of users/user.tsx' };
}
