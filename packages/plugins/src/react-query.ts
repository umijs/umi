import { dirname } from 'path';
import { IApi } from 'umi';
import { resolveProjectDep } from './utils/resolveProjectDep';

export default (api: IApi) => {
  api.describe({
    key: 'reactQuery',
    config: {
      schema(Joi) {
        return Joi.object({
          devtool: Joi.boolean(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  let pkgPath: string;
  const defaultPkgPath = dirname(
    require.resolve('@tanstack/react-query/package.json'),
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

  api.onGenerateFiles(() => {
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
export {
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
