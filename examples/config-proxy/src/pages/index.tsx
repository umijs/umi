import React, { useEffect, useState } from 'react';
import type { FC } from 'react';

interface IUser {
  id: number;
  name: string;
}

const IndexPage: FC = () => {
  const [users, setUsers] = useState<IUser[]>([]);

  const getData = () => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((res) => {
        setUsers(res);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      {users.map((user: IUser) => (
        <li key={user.id}>{user.name}</li>
      ))}

      <pre>
        {`import { defineConfig } from 'umi';

const proxyMap = {
  dev: {
    '/api': {
      target: 'http://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
  test: {
    '/api': {
      target: 'http://jsonplaceholder.typicode.com/',
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
    },
  },
};

const { APP_ENV = 'dev' } = process.env;

export default defineConfig({
  proxy: proxyMap[APP_ENV],
});
`}
      </pre>

      <p>doc:https://umijs.org/zh-CN/config#proxy</p>
      <p>
        <code>yarn start</code> can use dev env proxy config
      </p>
      <p>
        <code>yarn start:test</code> can use test env proxy config
      </p>
      <p>
        <code>APP_ENV</code> is defined in the package.json file
      </p>
    </div>
  );
};

export default IndexPage;
