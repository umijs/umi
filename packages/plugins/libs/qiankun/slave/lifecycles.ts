// @ts-nocheck
import { getPluginManager } from '@@/core/plugin';
import ReactDOM from 'react-dom';
import { ApplyPluginsType, history, __getRoot } from 'umi';
import { setModelState } from './qiankunModel';

const noop = () => {};

type Defer = {
  promise: Promise<any>;
  resolve(value?: any): void;
};

// @ts-ignore
const defer: Defer = {};
defer.promise = new Promise((resolve) => {
  defer.resolve = resolve;
});

let render = noop;
let hasMountedAtLeastOnce = false;

export default () => defer.promise;
export const contextOptsStack: any[] = [];

function normalizeHistory(
  history?: 'string' | Record<string, any>,
  base?: string,
) {
  let normalizedHistory: Record<string, any> = {};
  if (base) normalizedHistory.basename = base;
  if (history) {
    if (typeof history === 'string') {
      normalizedHistory.type = history;
    } else {
      normalizedHistory = history;
    }
  }

  return normalizedHistory;
}

async function getSlaveRuntime() {
  const config = await getPluginManager().applyPlugins({
    key: 'qiankun',
    type: ApplyPluginsType.modify,
    initialValue: {},
    async: true,
  });
  // 应用既是 master 又是 slave 的场景，运行时 slave 配置方式为 export const qiankun = { slave: {} }
  const { slave } = config;
  return slave || config;
}

export function genBootstrap(oldRender: typeof noop) {
  return async (props: any) => {
    const slaveRuntime = await getSlaveRuntime();
    if (slaveRuntime.bootstrap) {
      await slaveRuntime.bootstrap(props);
    }
    render = oldRender;
  };
}

export function genMount(mountElementId: string) {
  return async (props?: any) => {
    // props 有值时说明应用是通过 lifecycle 被主应用唤醒的，而不是独立运行时自己 mount
    if (typeof props !== 'undefined') {
      setModelState(props);

      const slaveRuntime = await getSlaveRuntime();
      if (slaveRuntime.mount) {
        await slaveRuntime.mount(props);
      }

      const { type, ...historyOpts } = normalizeHistory(
        props?.history || {},
        props?.base,
      );

      // 更新 clientRender 配置
      const clientRenderOpts = {
        callback: () => {
          // 默认开启
          // 如果需要手动控制 loading，通过主应用配置 props.autoSetLoading false 可以关闭
          if (props.autoSetLoading && typeof props.setLoading === 'function') {
            props.setLoading(false);
          }

          // 支持将子应用的 history 回传给父应用
          if (typeof props?.onHistoryInit === 'function') {
            props.onHistoryInit(history);
          }
        },
        // 支持通过 props 注入 container 来限定子应用 mountElementId 的查找范围
        // 避免多个子应用出现在同一主应用时出现 mount 冲突
        rootElement:
          props.container?.querySelector(`#${mountElementId}`) ||
          document.getElementById(mountElementId),

        basename: props.base,

        // 支持 MicroAppWithMemoHistory 需要
        historyType: type,
        historyOpts: historyOpts,

        // 当存在同一个 umi 子应用在同一个页面被多实例渲染的场景时（比如一个页面里，同时展示了这个子应用的多个路由页面）
        // mount 钩子会被调用多次，但是具体什么时候对应的实例开始 render 则是不定的，即它调用 applyPlugins('modifyClientRenderOpts') 的时机是不确定的
        // 为了保证每次 applyPlugins('modifyClientRenderOpts') 调用是生成正确的 history，我们需要这里通过闭包上下文维持 mount 调用时的一些配置信息
        // FIXME 由于 umi history 是全局的，通过 import { history } from 'umi' 调用的永远都是最后一个调用 createHistory 产生的对象，所以这种场景下会存在子应用内部获取 history 时，获取到的是同一个 history 的问题。这种场景下就不能直接从 umi import history，而应该从组件的 props 中取
        // getHistory() {
        //   // 动态改变 history
        //   const historyOptions = normalizeHistory(props.history, props.base);
        //   setCreateHistoryOptions(historyOptions);
        //
        //   // FIXME 子应用嵌入模式下不支持热更
        //   return createHistory();
        // },
      };

      contextOptsStack.push(clientRenderOpts);
    }

    // 第一次 mount defer 被 resolve 后umi 会自动触发 render，非第一次 mount 则需手动触发
    if (hasMountedAtLeastOnce) {
      render();
    } else {
      defer.resolve();
    }

    hasMountedAtLeastOnce = true;
  };
}

export function genUpdate() {
  return async (props: any) => {
    setModelState(props);
    const slaveRuntime = await getSlaveRuntime();
    if (slaveRuntime.update) {
      await slaveRuntime.update(props);
    }
  };
}

export function genUnmount(mountElementId: string) {
  return async (props: any) => {
    const root = __getRoot();

    // support react 18 unmount
    if (typeof root?.unmount === 'function') {
      root.unmount();
    } else {
      const container = props?.container
        ? props.container.querySelector(`#${mountElementId}`)
        : document.getElementById(mountElementId);
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
    }

    const slaveRuntime = await getSlaveRuntime();
    if (slaveRuntime.unmount) await slaveRuntime.unmount(props);
  };
}
