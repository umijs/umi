import React from 'react';
import { Link, Outlet, useClientLoaderData } from 'umi';

export default () => {
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <Link to="/">Go back</Link>
      <h1>Users layout</h1>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <Link to="/users/user" style={{ marginRight: 8 }}>
        /users/user
      </Link>
      <Link to="/users/user2">/users/user2</Link>
      <Outlet />
    </div>
  );
};

export async function clientLoader() {
  /** 模拟请求数据很慢的情况（需要用 pnpm start --dir example/client-loader 才能生效） */
  const res = await fetch('/api/mock?file=users.tsx');
  if (res.ok) return res.json();

  /** 服务端模拟不可用，改为客户端主动延迟 */
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users.tsx' };
}
