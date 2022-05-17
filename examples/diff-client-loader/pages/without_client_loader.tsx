import React, { useEffect, useState } from 'react';
// @ts-ignore
import { Outlet } from 'umi';

export default () => {
  const [title, setTitle] = useState('');
  useEffect(() => {
    (async () => {
      const res = await fetch('/api?delay=1000&title=without-client-loader');
      const { title } = await res.json();
      setTitle(title);
    })();
  }, []);
  if (!title) return null;
  return (
    <div>
      <h2>title: {title}</h2>
      <Outlet />
    </div>
  );
};
