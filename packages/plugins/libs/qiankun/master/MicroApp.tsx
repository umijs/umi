// @ts-nocheck
/* eslint-disable */
__USE_MODEL__;
import concat from 'lodash/concat';
import mergeWith from 'lodash/mergeWith';
import noop from 'lodash/noop';
import {
  FrameworkConfiguration,
  loadMicroApp,
  MicroApp as MicroAppType,
  prefetchApps,
} from 'qiankun';
import React, {
  forwardRef,
  Ref,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { qiankunStateForSlaveModelNamespace } from './constants';
import { ErrorBoundary } from './ErrorBoundary';
import { getMasterOptions } from './masterOptions';
import MicroAppLoader from './MicroAppLoader';
import { MasterOptions } from './types';

type HashHistory = {
  type?: 'hash';
} & any;

type BrowserHistory = {
  type?: 'browser';
} & any;

type MemoryHistory = {
  type?: 'memory';
} & any;

export type Props = {
  name: string;
  settings?: FrameworkConfiguration;
  base?: string;
  history?:
    | 'hash'
    | 'browser'
    | 'memory'
    | HashHistory
    | BrowserHistory
    | MemoryHistory;
  getMatchedBase?: () => string;
  loader?: (loading: boolean) => React.ReactNode;
  errorBoundary?: (error: any) => React.ReactNode;
  onHistoryInit?: (history: any) => void;
  autoSetLoading?: boolean;
  autoCaptureError?: boolean;
  // 仅开启 loader 时需要
  wrapperClassName?: string;
  className?: string;
} & Record<string, any>;

function unmountMicroApp(microApp?: MicroAppType) {
  if (microApp) {
    microApp.mountPromise.then(() => microApp.unmount());
  }
}

let noneMounted = true;

export const MicroApp = forwardRef(
  (componentProps: Props, componentRef: Ref<MicroAppType>) => {
    const {
      masterHistoryType,
      apps = [],
      lifeCycles: globalLifeCycles,
      prefetch = true,
      appNameKeyAlias = 'name',
      prefetchThreshold = 5,
      ...globalSettings
    } = getMasterOptions() as MasterOptions;

    const {
      settings: settingsFromProps = {},
      loader,
      errorBoundary,
      lifeCycles,
      wrapperClassName,
      className,
      ...propsFromParams
    } = componentProps;

    // ref: https://github.com/umijs/plugins/pull/866
    // name 跟 appNameKeyAlias 这两个 key 同时存在时，优先使用 name，避免对存量应用造成 breaking change。
    // 比如 appNameKeyAlias 配置是 id，但之前 id 正好作为普通的 props 使用过，如 <MicroApp name="app" id="123" />
    // 正常场景会优先匹配 appNameKeyAlias 对应的字段，fallback 到 name，避免对已经使用 <MicroApp name="app" /> 的应用造成影响
    const name =
      componentProps.name && componentProps[appNameKeyAlias]
        ? componentProps.name
        : componentProps[appNameKeyAlias] || componentProps.name;
    const isCurrentApp = (app: any) =>
      app[appNameKeyAlias] === name || app.name === name;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    // 未配置自定义 errorBoundary 且开启了 autoCaptureError 场景下，使用插件默认的 errorBoundary，否则使用自定义 errorBoundary
    const microAppErrorBoundary =
      errorBoundary ||
      (propsFromParams.autoCaptureError
        ? (e) => <ErrorBoundary error={e} />
        : null);

    // 配置了 errorBoundary 才改 error 状态，否则直接往上抛异常
    const setComponentError = (error: any) => {
      if (microAppErrorBoundary) {
        setError(error);
        // error log 出来，不要吞
        if (error) {
          console.error(error);
        }
      } else if (error) {
        throw error;
      }
    };

    const containerRef = useRef<HTMLDivElement>();
    const microAppRef = useRef<MicroAppType>();
    const updatingPromise = useRef<Promise<any>>();
    const updatingTimestamp = useRef(Date.now());

    useImperativeHandle(componentRef, () => microAppRef.current);

    const appConfig = apps.find((app: any) => isCurrentApp(app));
    useEffect(() => {
      if (!appConfig) {
        setComponentError(
          new Error(
            `[@umijs/plugin-qiankun]: Can not find the configuration of ${name} app!`,
          ),
        );
      }
      return noop;
    }, []);

    // 约定使用 src/app.ts/useQiankunStateForSlave 中的数据作为主应用透传给微应用的 props，优先级高于 propsFromConfig
    const stateForSlave = (useModel || noop)(
      qiankunStateForSlaveModelNamespace,
    );
    const { entry, props: propsFromConfig = {} } = appConfig || {};

    useEffect(() => {
      setComponentError(null);
      setLoading(true);
      const configuration = {
        globalContext: window,
        ...globalSettings,
        ...settingsFromProps,
      };
      microAppRef.current = loadMicroApp(
        {
          name,
          entry,
          container: containerRef.current!,
          props: {
            ...propsFromConfig,
            ...stateForSlave,
            ...propsFromParams,
            globalRoutesInfo: {
              masterHistoryType,
              routes: globalSettings.routes,
            },
            setLoading,
          },
        },
        configuration,
        mergeWith({}, globalLifeCycles, lifeCycles, (v1, v2) =>
          concat(v1 ?? [], v2 ?? []),
        ),
      );

      // 当配置了 prefetch true 时，在第一个应用 mount 完成之后，再去预加载其他应用
      if (prefetch && prefetch !== 'all' && noneMounted) {
        microAppRef.current?.mountPromise.then(() => {
          if (noneMounted) {
            if (Array.isArray(prefetch)) {
              const specialPrefetchApps = apps.filter(
                (app) =>
                  !isCurrentApp(app) &&
                  (prefetch.indexOf(app[appNameKeyAlias]) !== -1 ||
                    prefetch.indexOf(app.name) !== -1),
              );
              prefetchApps(specialPrefetchApps, configuration);
            } else {
              // 不能无脑全量 prefetch，需要有一个阈值
              const otherNotMountedApps = apps
                .filter((app) => !isCurrentApp(app))
                .slice(0, prefetchThreshold);
              prefetchApps(otherNotMountedApps, configuration);
            }
            noneMounted = false;
          }
        });
      }

      (['loadPromise', 'bootstrapPromise', 'mountPromise'] as const).forEach(
        (key) => {
          const promise = microAppRef.current?.[key];
          promise.catch((e) => {
            setComponentError(e);
            setLoading(false);
          });
        },
      );

      return () => unmountMicroApp(microAppRef.current);
    }, [name]);

    useEffect(() => {
      const microApp = microAppRef.current;
      if (microApp) {
        if (!updatingPromise.current) {
          // 初始化 updatingPromise 为 microApp.mountPromise，从而确保后续更新是在应用 mount 完成之后
          updatingPromise.current = microApp.mountPromise;
        } else {
          // 确保 microApp.update 调用是跟组件状态变更顺序一致的，且后一个微应用更新必须等待前一个更新完成
          updatingPromise.current = updatingPromise.current.then(() => {
            const canUpdate = (microApp?: MicroAppType) =>
              microApp?.update && microApp.getStatus() === 'MOUNTED';
            if (canUpdate(microApp)) {
              const props = {
                ...propsFromConfig,
                ...stateForSlave,
                ...propsFromParams,
                globalRoutesInfo: {
                  masterHistoryType,
                  routes: globalSettings.routes,
                },
                setLoading,
              };

              if (process.env.NODE_ENV === 'development') {
                if (Date.now() - updatingTimestamp.current < 200) {
                  console.warn(
                    `[@umijs/plugin-qiankun] It seems like microApp ${name} is updating too many times in a short time(200ms), you may need to do some optimization to avoid the unnecessary re-rendering.`,
                  );
                }

                console.info(
                  `[@umijs/plugin-qiankun] MicroApp ${name} is updating with props: `,
                  props,
                );
                updatingTimestamp.current = Date.now();
              }

              // 返回 microApp.update 形成链式调用
              // @ts-ignore
              return microApp.update(props);
            }

            return void 0;
          });
        }
      }

      return noop;
    }, Object.values({ ...stateForSlave, ...propsFromParams }));

    // 未配置自定义 loader 且开启了 autoSetLoading 场景下，使用插件默认的 loader，否则使用自定义 loader
    const microAppLoader =
      loader ||
      (propsFromParams.autoSetLoading
        ? (loading) => <MicroAppLoader loading={loading} />
        : null);

    return Boolean(microAppLoader) || Boolean(microAppErrorBoundary) ? (
      <div style={{ position: 'relative' }} className={wrapperClassName}>
        {Boolean(microAppLoader) && microAppLoader(loading)}
        {Boolean(microAppErrorBoundary) &&
          Boolean(error) &&
          microAppErrorBoundary(error)}
        <div ref={containerRef} className={className} />
      </div>
    ) : (
      <div ref={containerRef} className={className} />
    );
  },
);
