interface IRoute {
  path: string;
  exact?: boolean;
  component?: any;
  children: IRoute[];
  [key: string]: any;
}

interface IOpts {
  routes: IRoute[];
  rootElement: string | HTMLElement;
  initialProps?: object;
  children: any;
  plugins: any;
}

export default function(IOpts) {}
