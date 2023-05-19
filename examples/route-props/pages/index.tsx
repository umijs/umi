import { share } from '@/props';
import { useRouteProps } from 'umi';

export default function Page() {
  const routes: typeof routeProps = useRouteProps();

  return <div className="routeProps">{JSON.stringify(routes)}</div>;
}

export const routeProps = {
  name: 'IndexMenuName',
  // internal props, will occur error if you set it
  // path: "/",
  menuRender: false,
  hideInMenu: true,

  // static props
  a: 1,

  // dynamic props
  b: () => 2,
  // @ts-ignore
  c: window.c,
  d: share,
};
