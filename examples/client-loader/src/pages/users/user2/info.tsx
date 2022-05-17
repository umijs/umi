import React from 'react';
import { useClientLoaderData } from 'umi';

export default () => {
  const clientLoaderData = useClientLoaderData();
  return (
    <div style={{ borderWidth: 2, padding: 10 }}>
      <h1>Info</h1>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
    </div>
  );
};

export async function clientLoader() {
  /** 模拟请求数据很慢的情况（需要用 pnpm start --dir example/client-loader 才能生效） */
  const res = await fetch('/api/mock?file=users/user2/info.tsx');
  if (res.ok) return res.json();

  /** 服务端模拟不可用，改为客户端主动延迟 */
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of users/user2/info.tsx' };
}
