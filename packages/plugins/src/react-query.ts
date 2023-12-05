import { winPath } from '@umijs/utils';
import { dirname } from 'path';
import { IApi } from 'umi';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    key: 'reactQuery',
    config: {
      schema({ zod }) {
        return zod
          .object({
            devtool: zod.union([zod.record(zod.any()), zod.boolean()]),
            queryClient: zod.union([zod.record(zod.any()), zod.boolean()]),
          })
          .deepPartial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  let pkgPath: string;
  const defaultPkgPath = winPath(
    dirname(require.resolve('@tanstack/react-query/package.json')),
  );
  const devtoolPkgPath = winPath(
    dirname(require.resolve('@tanstack/react-query-devtools/package.json')),
  );
  try {
    const localQueryPath = resolveProjectDep({
      pkg: api.pkg,
      cwd: api.cwd,
      dep: '@tanstack/react-query',
    });
    pkgPath = localQueryPath ? winPath(localQueryPath) : defaultPkgPath;
  } catch (e: any) {
    throw new Error(`[reactQuery] package resolve failed, ${e.message}`);
  }

  api.onStart(() => {
    if (pkgPath !== defaultPkgPath) {
      api.logger.info(`[reactQuery] use local package ${pkgPath}`);
    }
  });

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.addRuntimePluginKey(() => {
    return ['reactQuery'];
  });

  api.onGenerateFiles(() => {
    const enableDevTools = api.config.reactQuery.devtool !== false;
    const enableQueryClient = api.config.reactQuery.queryClient !== false;
    const reactQueryRuntimeCode = api.appData.appJS?.exports.includes(
      'reactQuery',
    )
      ? `import { reactQuery as reactQueryConfig } from '@/app';`
      : `const reactQueryConfig = {};`;
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: enableQueryClient
        ? `
import React from 'react';
import { defaultContext, QueryClient, QueryClientProvider } from '${pkgPath}';
import { ReactQueryDevtools } from '${devtoolPkgPath}';
${reactQueryRuntimeCode}
const client = new QueryClient(reactQueryConfig.queryClient || {});
export function rootContainer(container) {
  return (
    <QueryClientProvider client={client} context={defaultContext}>
      {container}
      ${
        enableDevTools
          ? '<ReactQueryDevtools context={defaultContext} initialIsOpen={false} {...(reactQueryConfig.devtool || {})} />'
          : ''
      }
    </QueryClientProvider>
  );
}
      `
        : '',
    });
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
export {
  // from @tanstack/query-core
  QueryClient,
  MutationObserver,
  MutationCache,
  InfiniteQueryObserver,
  QueriesObserver,
  QueryObserver,
  QueryCache,
  // from @tanstack/react-query
  useIsRestoring,
  IsRestoringProvider,
  useInfiniteQuery,
  useIsMutating,
  useIsFetching,
  useMutation,
  useQueries,
  useQuery,
  QueryClientProvider,
  useQueryClient,
  QueryErrorResetBoundary,
  useQueryErrorResetBoundary,
} from '${pkgPath}';
      `,
    });
    api.writeTmpFile({
      path: 'types.d.ts',
      content: `
export type {
  // from @tanstack/query-core
  Query, QueryState, Mutation,
  // from @tanstack/react-query
  QueriesResults,
  QueriesOptions,
  QueryErrorResetBoundaryProps,
  QueryClientProviderProps,
  ContextOptions as QueryContextOptions,
  UseQueryOptions,
  UseBaseQueryOptions,
  UseQueryResult,
  UseBaseQueryResult,
  UseInfiniteQueryOptions,
  UseMutationResult,
  UseMutateFunction,
  UseMutateAsyncFunction,
  UseBaseMutationResult,
} from '${pkgPath}';
      `,
    });
  });
};
