import * as Babel from '@umijs/bundler-utils/compiled/babel/core';
import {
  // @ts-ignore
  addDefault,
  // @ts-ignore
  addNamed,
  // @ts-ignore
  addNamespace,
} from '@umijs/bundler-utils/compiled/babel/helper-module-imports';
import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { basename, extname } from 'path';
import { IOpts } from './lowImport';

interface IPluginOpts {
  opts: IOpts;
  css: string;
  umiImportItems: string[];
  reactImportItems: string[];
}

const CACHE_LIBS = 'cacheLibs';
function save(
  file: any,
  libName: string,
  name: string,
  newNode: Babel.NodePath,
) {
  const cacheLibs = file.get(CACHE_LIBS);
  const cache = cacheLibs[libName] || {};
  cache[name] = newNode;
  cacheLibs[libName] = cache;
  file.set(CACHE_LIBS, cacheLibs);
}
function getCache(file: any, libName: string, name: string) {
  const cacheLibs = file.get(CACHE_LIBS);
  const cache = cacheLibs[libName] || {};
  return cache[name];
}

function replaceWith(
  path: Babel.NodePath,
  name: string,
  libName: string,
  file: any,
  getNode: () => Babel.NodePath,
) {
  let newNode = getCache(file, name, libName);
  if (!newNode) {
    newNode = getNode();
    save(file, name, libName, newNode);
  }
  path.replaceWith(newNode);
}

export default function () {
  return {
    pre(file: any) {
      file.set(CACHE_LIBS, {});
    },
    visitor: {
      Identifier(
        path: Babel.NodePath<t.Identifier>,
        state: { opts: IPluginOpts; file: any },
      ) {
        const { name } = path.node;
        if (path.scope.hasBinding(path.node.name)) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (
          t.isImportSpecifier(parentNode) ||
          t.isImportDefaultSpecifier(parentNode) ||
          t.isImportNamespaceSpecifier(parentNode)
        ) {
          return;
        }
        // don't support member expression
        // e.g. foo.styles
        if (
          t.isMemberExpression(parentNode) &&
          path.node === parentNode.property
        ) {
          return;
        }
        // don't support object property
        // e.g. { styles: 1 }
        if (t.isObjectProperty(parentNode) && path.node === parentNode.key) {
          return;
        }
        if (state.opts.opts.identifierToLib?.hasOwnProperty(name)) {
          const libName = state.opts.opts.identifierToLib[name];
          replaceWith(path, name, libName, state.file, () =>
            addNamed(path, name, libName),
          );
        } else if (state.opts.opts.defaultToLib?.hasOwnProperty(name)) {
          const libName = state.opts.opts.defaultToLib[name];
          replaceWith(path, name, libName, state.file, () =>
            addDefault(path, libName, {
              nameHint: name,
            }),
          );
        } else if (state.opts.opts.namespaceToLib?.hasOwnProperty(name)) {
          const libName = state.opts.opts.namespaceToLib[name];
          replaceWith(path, name, libName, state.file, () =>
            addNamespace(path, libName),
          );
        }
        // import css
        if (name === 'styles' && state.opts.css) {
          const { filename } = state.file.opts;
          const cssFilename =
            basename(filename, extname(filename)) + '.' + state.opts.css;
          replaceWith(path, name, './' + cssFilename, state.file, () =>
            addDefault(path, './' + cssFilename, { nameHint: name }),
          );
        }

        // import umi
        if (state.opts.umiImportItems?.includes(name)) {
          replaceWith(path, name, 'umi', state.file, () =>
            addNamed(path, name, 'umi'),
          );
        }

        // import React
        if (name === 'React') {
          replaceWith(path, name, 'react', state.file, () =>
            addDefault(path, 'react', { nameHint: name }),
          );
        }
        if (state.opts.reactImportItems?.includes(name)) {
          replaceWith(path, name, 'react', state.file, () =>
            addNamed(path, name, 'react'),
          );
        }
      },
      MemberExpression(
        path: Babel.NodePath<t.MemberExpression>,
        state: { opts: IPluginOpts; file: any },
      ) {
        const { object, property } = path.node as {
          object: t.Identifier;
          property: t.Identifier;
        };
        if (path.scope.hasBinding(object.name)) {
          return;
        }
        const parentNode = path.parentPath.node;
        if (
          t.isImportSpecifier(parentNode) ||
          t.isImportDefaultSpecifier(parentNode) ||
          t.isImportNamespaceSpecifier(parentNode)
        ) {
          return;
        }
        if (
          state.opts.opts.withObjs?.[object.name] &&
          (state.opts.opts.withObjs?.[object.name].members || []).includes(
            property.name,
          )
        ) {
          const libName = state.opts.opts.withObjs[object.name].importFrom;
          replaceWith(path, property.name, libName, state.file, () =>
            addNamed(path, property.name, libName),
          );
        }
      },
    },
  };
}
