// @ts-ignore
import { Outlet } from 'umi';

const Layout = () => {
  return (
    <div>
      <h1>公共layout</h1>
      <Outlet />
    </div>
  );
};

export default Layout;
