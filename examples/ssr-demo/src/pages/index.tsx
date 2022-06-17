import React from 'react';
import { Link, useClientLoaderData, useServerLoaderData } from 'umi';
import Button from '../components/Button';
// @ts-ignore
import bigImage from './big_image.jpg';
// @ts-ignore
import cssStyle from './index.css';
import './index.less';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import umiLogo from './umi.png';

export default function HomePage() {
  const clientLoaderData = useClientLoaderData();
  const serverLoaderData = useServerLoaderData();
  return (
    <div>
      <h1 className="title">Hello~</h1>
      <p className={styles.blue}>This is index.tsx</p>
      <p className={cssStyle.title}>I should be pink</p>
      <p className={cssStyle.blue}>I should be cyan</p>
      <Button />
      <img src={bigImage} alt="" />
      <img src={umiLogo} alt="umi" />
      <Link to="/users/user">/users/user</Link>
      <div style={{ backgroundColor: '#eee', padding: 12 }}>
        <p>
          点击这个按钮以后，需要加载 users, user2, info 三个路由组件需要的数据
        </p>
        <Link to="/users/user2/info">/users/user2/info</Link>
      </div>
      <p>client loader data: {JSON.stringify(clientLoaderData)}</p>
      <p>server loader data: {JSON.stringify(serverLoaderData)}</p>
    </div>
  );
}

export async function clientLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from client loader of index.tsx' };
}

export async function serverLoader() {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { message: 'data from server loader of index.tsx' };
}
