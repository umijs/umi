import { Input } from 'antd';
import { useId } from 'react';
import {
  ClientLoader,
  Link,
  MetadataLoader,
  ServerLoader,
  useClientLoaderData,
  useLoaderData,
  useServerInsertedHTML,
  useServerLoaderData,
} from 'umi';
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
// @ts-ignore

export default function HomePage() {
  const clientLoaderData = useClientLoaderData();
  const serverLoaderData = useServerLoaderData<typeof serverLoader>();
  const loaderData = useLoaderData<typeof serverLoader>();

  useServerInsertedHTML(() => {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: `.server_inserted_style { color: #1677ff }`,
        }}
      ></style>
    );
  });

  const id = useId();

  return (
    <div>
      <h1 className={styles.b}>Hello~1</h1>
      <p className="server_inserted_style">id: {id}</p>
      <p className={styles.blue}>This is index.tsx</p>
      <p className={cssStyle.title}>I should be pink</p>
      <p className={cssStyle.blue}>I should be cyan</p>
      <Button />
      <Input placeholder="这个样式不应该闪烁" />
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
      <p>merge loader data: {JSON.stringify(loaderData)}</p>
    </div>
  );
}

export const clientLoader: ClientLoader = async ({}) => {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { clientMessage: 'data from client loader of index.tsx' };
};
clientLoader.hydrate = true;

export const serverLoader: ServerLoader = async (req) => {
  const url = req?.request?.url;
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000));
  return { serverMessage: `data from server loader of index.tsx, url: ${url}` };
};

// SEO-设置页面的TDK
export const metadataLoader: MetadataLoader<{ message: string }> = (
  serverLoaderData,
) => {
  return {
    title: '开发者学堂 - 支付宝开放平台',
    description: '支付宝小程序开发入门实战经验在线课程，让更多的开发者获得成长',
    keywords: ['小程序开发', '入门', '实战', '小程序云'],
    lang: 'zh-CN',
    metas: [
      {
        name: 'msg',
        content: serverLoaderData.message,
      },
    ],
  };
};
