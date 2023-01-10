import { dirname } from 'path';
import { IApi } from 'umi';
import { resolveProjectDep } from './utils/resolveProjectDep';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    key: 'reactQuery',
    config: {
      schema(Joi) {
        return Joi.object({
          devtool: Joi.alternatives(Joi.object(), Joi.boolean()),
          queryClient: Joi.alternatives(Joi.object(), Joi.boolean()),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  let pkgPath: string;
  const defaultPkgPath = dirname(
    require.resolve('@tanstack/react-query/package.json'),
  );
  const devtoolPkgPath = dirname(
    require.resolve('@tanstack/react-query-devtools/package.json'),
  );
  try {
    pkgPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: '@tanstack/react-query',
      }) || defaultPkgPath;
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

  api.onGenerateFiles(() => {
    const enableDevTools = api.config.reactQuery.devtool !== false;
    const enableQueryClient = api.config.reactQuery.queryClient !== false;
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: enableQueryClient
        ? `
import { defaultContext, QueryClient, QueryClientProvider } from '${pkgPath}';
import { ReactQueryDevtools } from '${devtoolPkgPath}';
const client = new QueryClient();
export function rootContainer(container) {
  return (
    <QueryClientProvider client={client} context={defaultContext}>
      {container}
      ${
        enableDevTools
          ? '<ReactQueryDevtools context={defaultContext} initialIsOpen={false} />'
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
