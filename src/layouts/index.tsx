import { Link, Outlet, useParams } from "umi";
import styles from "./index.less";
import { Drawer } from "antd";
import useSWR from "swr";
import { Suspense } from "react";

const Greeting = () => {
  useSWR<string>(
    ["any"],
    async () => {
      return "null";
    },
    // 条件1: 必须，swr 开 suspense 才能复现
    { suspense: true },
  );

  // return "Greeting";
  return <Suspense fallback="fb">Greeting</Suspense>;
};

export default function Layout() {
  // 订阅一下路径变更，路径变更重新渲染
  useParams();

  const show = window.location.pathname === "/";

  return (
    <div className={styles.navs}>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/docs">Docs</Link>
        </li>
      </ul>
      {/* 条件2: 必须，从 /docs 页面（刷新一下）进入 /home */}
      {show && (
        // 解法1: 用 <Suspense> 包一下可解（不知道原理）
        // <Suspense>
          <Greeting />
        // </Suspense>
      )}
      {/* 条件3: 必须，开启 forceRender 时才会触发 */}
      <Drawer forceRender>123</Drawer>
      <Outlet />
    </div>
  );
}
