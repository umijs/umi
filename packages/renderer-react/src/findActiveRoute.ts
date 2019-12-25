import { IRoute } from './types';

interface IOpts {
  routes: IRoute[];
  pathname: string;
}

export default function(opts: IOpts): IRoute {
  // TODO: implement

  return {
    path: '',
  };
}
