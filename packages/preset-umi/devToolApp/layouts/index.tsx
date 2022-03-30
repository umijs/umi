import React from 'react';
// @ts-ignore
import { Link, Outlet, useAppData } from 'umi';
import styles from './index.less';

function upperFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default () => {
  const { clientRoutes } = useAppData();
  return (
    <div>
      <div className={styles.nav}>
        <div key="/">
          <Link to="/">Home</Link>
        </div>
        {clientRoutes[0].routes
          // sort by alphabet
          .sort((a: any, b: any) => {
            return a.path > b.path ? 1 : -1;
          })
          .filter(({ path }: any) => {
            return path !== '/';
          })
          .map(({ path }: any) => {
            const title = path === 'mfsu' ? 'MFSU' : upperFirst(path);
            return (
              <div key={path}>
                <Link to={path}>{title}</Link>
              </div>
            );
          })}
      </div>
      <hr />
      <Outlet />
    </div>
  );
};
