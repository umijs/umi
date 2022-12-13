import React, { useEffect } from 'react';
import { request } from 'umi';

function Page() {
  useEffect(() => {
    (async () => {
      const res = await request('/api/users');
      console.log(res);
    })();
  }, []);
  return (
    <div>
      <h1>Umi working Request Plugin</h1>
    </div>
  );
}

export default Page;
