import { IApi, RUNTIME_TYPE_FILE_NAME } from 'umi';
import { withTmpPath } from './utils/withTmpPath';

export default (api: IApi) => {
  api.describe({
    config: {
      schema({ zod }) {
        return zod
          .object({
            loading: zod.string(),
          })
          .partial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.register({
    key: 'addExtraModels',
    fn: () => [
      withTmpPath({
        api,
        path: '@@initialState.ts#{"namespace":"@@initialState"}',
      }),
    ],
  });

  api.addRuntimePluginKey(() => ['getInitialState']);

  api.addRuntimePlugin(() => {
    return [withTmpPath({ api, path: 'runtime.tsx' })];
  });

  api.onGenerateFiles(() => {
    const { loading } = api.config.initialState;
    // Provider.tsx
    api.writeTmpFile({
      path: 'Provider.tsx',
      content: `
import React from 'react';
import { useModel } from '@@/plugin-model';
${
  loading
    ? `import Loading from '${loading}'`
    : `function Loading() { return <div />; }`
}
export default function InitialStateProvider(props: any) {
  const appLoaded = React.useRef(false);
  const { loading = false } = useModel("@@initialState") || {};
  React.useEffect(() => {
    if (!loading) {
      appLoaded.current = true;
    }
  }, [loading]);
  if (loading && !appLoaded.current && typeof window !== 'undefined') {
    return <Loading />;
  }
  return props.children;
}
      `,
    });

    // @@initialState.ts
    api.writeTmpFile({
      path: '@@initialState.ts',
      content: api.appData.appJS?.exports.includes('getInitialState')
        ? `
import { useState, useEffect, useCallback } from 'react';
import { getInitialState } from '@/app';

export type InitialStateType = Awaited<ReturnType<typeof getInitialState>> | undefined;

const initState = {
  initialState: undefined as InitialStateType,
  loading: true,
  error: undefined,
};

export default () => {
  const [state, setState] = useState(initState);
  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const ret = await getInitialState();
      setState((s) => ({ ...s, initialState: ret, loading: false }));
    } catch (e) {
      setState((s) => ({ ...s, error: e, loading: false }));
    }
  }, []);

  const setInitialState = useCallback(
    async (
      initialState: InitialStateType | ((initialState: InitialStateType) => InitialStateType),
    ) => {
      setState((s) => {
        if (typeof initialState === 'function') {
          return { ...s, initialState: initialState(s.initialState), loading: false };
        }
        return { ...s, initialState, loading: false };
      });
    },
    [],
  );

  useEffect(() => {
    refresh();
  }, []);

  return {
    ...state,
    refresh,
    setInitialState,
  };
}
        `
        : `
export default () => ({ loading: false, refresh: () => {} })
      `,
    });

    // runtime.tsx
    api.writeTmpFile({
      path: 'runtime.tsx',
      content: `
import React from 'react';
import Provider from './Provider';
export function dataflowProvider(container) {
  return <Provider>{ container }</Provider>;
}
      `,
    });

    api.writeTmpFile({
      path: RUNTIME_TYPE_FILE_NAME,
      content: `
export interface IRuntimeConfig {
  getInitialState?: () => Promise<Record<string, any>>
}
      `,
    });
  });
};
