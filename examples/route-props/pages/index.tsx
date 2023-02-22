import { share } from '@/props';
import { useRouteProps } from 'umi';

export default function Page() {
  const routes = useRouteProps();
  console.log('routes: ', routes);

  return <div>index</div>;
}

export const routeProps = {
  // internal props, will occur error if you set it
  // path: "/",

  // static props
  a: 1,

  // dynamic props
  b: () => 2,
  // @ts-ignore
  c: window.c,
  d: share,
};
