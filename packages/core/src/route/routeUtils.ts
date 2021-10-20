import { IRoute } from '../types';

export function addParentRoute(opts: {
  id?: string;
  addToAll?: boolean;
  target: IRoute;
  routes: Record<string, IRoute>;
}) {
  if (opts.addToAll) {
    for (const id of Object.keys(opts.routes)) {
      if (opts.routes[id].parentId === undefined) {
        opts.routes[id].parentId = opts.target.id;
      }
    }
  } else if (opts.id) {
    opts.routes[opts.id].parentId = opts.target.id;
  } else {
    throw new Error(
      `addParentRoute failed, opts.addToAll or opts.id must be supplied.`,
    );
  }

  // add new route
  opts.routes[opts.target.id] = opts.target;
}
