import { RuntimeReactQueryType } from 'umi';

export const reactQuery: RuntimeReactQueryType = {
  queryClient: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  },
  devtool: {
    buttonPosition: 'bottom-left',
  },
};
