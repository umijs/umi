import { lstatSync, readdirSync } from 'fs';
import { join, relative, resolve } from 'path';
import {
  byLongestFirst,
  createRouteId,
  findParentRouteId,
  isRouteModuleFile,
} from './utils';

export function getRoutes(opts: { base: string }) {
  const files: { [routeId: string]: string } = {};
  visitFiles({
    dir: opts.base,
    visitor: (file) => {
      const routeId = createRouteId(join('routes', file));
      if (isRouteModuleFile({ file })) {
        files[routeId] = join('routes', file);
      } else {
        throw new Error(`Invalid route module file: ${join(opts.base, file)}`);
      }
    },
  });

  const routeIds = Object.keys(files).sort(byLongestFirst);
  const childRouteIds = routeIds.filter(
    (id) => findParentRouteId(routeIds, id) === undefined,
  );
  console.log('test', childRouteIds);
}

function visitFiles(opts: {
  dir: string;
  visitor: (file: string) => void;
  baseDir?: string;
}): void {
  opts.baseDir ||= opts.dir;
  for (let filename of readdirSync(opts.dir)) {
    let file = resolve(opts.dir, filename);
    let stat = lstatSync(file);
    if (stat.isDirectory()) {
      visitFiles({ ...opts, dir: file });
    } else if (stat.isFile()) {
      opts.visitor(relative(opts.baseDir, file));
    }
  }
}
