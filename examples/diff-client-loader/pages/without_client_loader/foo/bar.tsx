import React, { useEffect, useState } from 'react';
// @ts-ignore
import { Outlet } from 'umi';

export default () => {
  const [title, setTitle] = useState('');
  useEffect(() => {
    (async () => {
      const res = await fetch('/api?delay=1000&title=bar');
      const { title } = await res.json();
      setTitle(title);
    })();
  }, []);
  return (
    <div>
      <h2>title: {title}</h2>
      <Outlet />
    </div>
  );
};
