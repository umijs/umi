import { winPath } from '@umijs/utils';
import { existsSync, lstatSync, readdirSync, statSync } from 'fs';
import { extname, relative, resolve } from 'path';
import { defineRoutes } from './defineRoutes';
import {
  byLongestFirst,
  createRouteId,
  findParentRouteId,
  isRouteModuleFile,
} from './utils';

// opts.base: path of pages
export function getConventionRoutes(opts: {
  base: string;
  prefix?: string;
  exclude?: RegExp[];
}) {
  const files: { [routeId: string]: string } = {};
  if (!(existsSync(opts.base) && statSync(opts.base).isDirectory())) {
    return {};
  }
  visitFiles({
    dir: opts.base,
    visitor: (file) => {
      const routeId = createRouteId(file);
      if (isRouteModuleFile({ file: winPath(file), exclude: opts.exclude })) {
        files[routeId] = winPath(file);
      }
    },
  });

  const routeIds = Object.keys(files).sort(byLongestFirst);

  function defineNestedRoutes(defineRoute: any, parentId?: string) {
    const childRouteIds = routeIds.filter(
      (id) => findParentRouteId(routeIds, id) === parentId,
    );
    for (let routeId of childRouteIds) {
      let routePath = createRoutePath(
        parentId ? routeId.slice(parentId.length + 1) : routeId,
      );
      defineRoute({
        path: routePath,
        file: `${opts.prefix || ''}${files[routeId]}`,
        children() {
          defineNestedRoutes(defineRoute, routeId);
        },
      });
    }
  }

  return defineRoutes(defineNestedRoutes);
}

function visitFiles(opts: {
  dir: string;
  visitor: (file: string) => void;
  baseDir?: string;
}): void {
  opts.baseDir = opts.baseDir || opts.dir;
  for (let filename of readdirSync(opts.dir)) {
    let file = resolve(opts.dir, filename);
    let stat = lstatSync(file);
    if (stat.isDirectory()) {
      visitFiles({ ...opts, dir: file });
    } else if (
      stat.isFile() &&
      ['.tsx', '.ts', '.js', '.jsx', '.md', '.mdx', '.vue'].includes(
        extname(file),
      )
    ) {
      opts.visitor(relative(opts.baseDir, file));
    }
  }
}

function createRoutePath(routeId: string): string {
  let path = routeId
    // routes/$ -> routes/*
    // routes/nested/$.tsx (with a "routes/nested.tsx" layout)
    .replace(/^\$$/, '*')
    // routes/docs.$ -> routes/docs/*
    // routes/docs/$ -> routes/docs/*
    .replace(/(\/|\.)\$$/, '/*')
    // routes/$user -> routes/:user
    .replace(/\$/g, ':')
    // routes/not.nested -> routes/not/nested
    .replace(/\./g, '/');

  // only replace two `index` in the end of path
  // /index/index -> '/index'
  // index/index -> 'index'
  // a-index/index -> 'a-index/index'
  path = /(^|\/)index\/index$/.test(path) ? path.replace(/\/index$/, '') : path;
  // /(?<!:)\/?\bindex$/
  // e/index true
  // index true
  // e/:index false
  // e/index -> e  index -> ''  e/:index -> e/:index
  path = /\b\/?(?<!:)index$/.test(path) ? path.replace(/\/?index$/, '') : path;
  path = /\b\/?README$/.test(path) ? path.replace(/\/?README$/, '') : path;

  return path;
}
