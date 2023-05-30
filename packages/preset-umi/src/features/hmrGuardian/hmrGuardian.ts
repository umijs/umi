import * as t from '@umijs/bundler-utils/compiled/babel/types';
import { lodash } from '@umijs/utils';
import { extname, parse, relative, sep } from 'path';
import { IApi } from '../../types';

export default function (api: IApi) {
  api.describe({
    key: 'hmrGuardian',
    config: {
      schema: ({ zod }) => zod.boolean(),
    },
    enableBy: ({ env, userConfig }) => {
      if (
        env === 'production' ||
        process.env.HMR === 'none' ||
        process.env.IS_UMI_BUILD_WORKER
      ) {
        return false;
      }

      return !!userConfig.hmrGuardian;
    },
  });

  api.onCheckConfig(({ userConfig }) => {
    userConfig.headScripts?.some((script: string | { src?: string }) => {
      const url = typeof script === 'string' ? script : script.src;

      if (url?.includes('react.production')) {
        api.logger.warn(
          'Using react/react-dom production scripts, HMR will not work.',
        );
        api.logger.warn(
          'Use ternary expression to use development scripts in dev environment',
        );
      }
    });
  });

  api.addBeforeBabelPlugins(() => {
    return [defaultRenameVisitor()];
  });
}

/**
 * convert path into componentName
 * like:
 *  - src/index.tsx => SrcIndex
 *  - components/Header.tsx => ComponentHeader
 *
 * @param filePath
 * @returns {string} componentName
 */
function path2Component(filePath: string): string {
  const { ext } = parse(filePath);
  return (
    filePath
      // remove extension
      .replace(ext, '')
      .split(sep)
      // upperFirst
      .map((item) => lodash.upperFirst(item.replace(/\W/g, '')))
      .join('')
  );
}

// @ts-ignore
function defaultRenameVisitor() {
  return {
    visitor: {
      // @ts-ignore
      ExportDefaultDeclaration: {
        enter(path: any, state: any) {
          const def = path.node.declaration;
          const { cwd, filename } = state.file.opts;
          const relativePath = relative(cwd, filename);

          if (
            /^\.(tsx|jsx)$/.test(extname(relativePath)) &&
            // hidden relativePath
            !/(^|\/)\.[^\/.]/g.test(relativePath) &&
            !relativePath.includes('node_modules')
          ) {
            let componentName = path2Component(relativePath);
            if (!componentName) {
              return;
            }

            // solve identifier conflict
            const identifiers = Object.keys(path.scope.bindings || {});
            // add index if conflict
            let idx = 0;
            // loop util componentName conflict
            while (identifiers.includes(componentName)) {
              componentName = `${componentName}${idx}`;
              idx += 1;
            }

            // generate component name identifier
            const named = t.identifier(componentName);

            if (t.isArrowFunctionExpression(def)) {
              const varDec = t.variableDeclaration('const', [
                t.variableDeclarator(named, def),
              ]);
              const [varDeclPath] = path.insertBefore(varDec);
              path.scope.registerDeclaration(varDeclPath);
              path.replaceWith(t.exportDefaultDeclaration(named));
            } else if (t.isFunctionDeclaration(def) && !def.id) {
              def.id = named;
            }
          }
        },
      },
    },
  };
}
