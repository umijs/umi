interface RouteData { pathname: string, query?: string }

declare const router: {
  push: (path: string | RouteData) => void;
  replace: (path: string | RouteData) => void;
  go: (count: number) => void;
  goBack: () => void;
}
export default router;
