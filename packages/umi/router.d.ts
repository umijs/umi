interface RouteData { pathname: string, query?: string | any }

declare const router: {
  push: (path: string | RouteData) => void;
  replace: (path: string | RouteData) => void;
  go: (count: number) => void;
  goBack: () => void;
}
export default router;
