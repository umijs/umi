import { Navigate } from 'dumi';

export function patchClientRoutes({ routes }) {
  routes.push({
    path: '/docs/tutorials/getting-started',
    element: <Navigate to="/docs/guides/getting-started" replace />,
  });
}
