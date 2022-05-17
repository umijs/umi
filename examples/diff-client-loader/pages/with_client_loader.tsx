import React from 'react';
// @ts-ignore
import { Outlet, useClientLoaderData } from 'umi';

export default () => {
  const data = useClientLoaderData();
  if (!data) return null;
  return (
    <div>
      <h2>title: {data.title}</h2>
      <Outlet />
    </div>
  );
};

export async function clientLoader() {
  const res = await fetch('/api?delay=1000&title=with-client-loader');
  return res.json();
}
