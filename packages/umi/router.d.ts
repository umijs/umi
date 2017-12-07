declare const router: {
  push: (path: string) => void;
  replace: (path: string) => void;
  go: (count: number) => void;
  goBack: () => void;
}
export default router;
