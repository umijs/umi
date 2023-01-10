import { dirname } from 'path';
import { IApi } from 'umi';

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

  // reexports with types
  const libPath = dirname(
    require.resolve('@tanstack/react-query/package.json'),
  );
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
} from '${libPath}';
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
} from '${libPath}';
      `,
    });
  });
};
