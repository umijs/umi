import isEqual from 'fast-deep-equal';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

// @ts-ignore
const Context = React.createContext<{ dispatcher: Dispatcher }>(null);

class Dispatcher {
  callbacks: Record<string, Set<Function>> = {};
  data: Record<string, unknown> = {};
  update = (namespace: string) => {
    if (this.callbacks[namespace]) {
      this.callbacks[namespace].forEach((cb) => {
        try {
          const data = this.data[namespace];
          cb(data);
        } catch (e) {
          cb(undefined);
        }
      });
    }
  };
}

interface ExecutorProps {
  hook: () => any;
  onUpdate: (val: any) => void;
  namespace: string;
}

function Executor(props: ExecutorProps) {
  const { hook, onUpdate, namespace } = props;

  const updateRef = useRef(onUpdate);
  const initialLoad = useRef(false);

  let data: any;
  try {
    data = hook();
  } catch (e) {
    console.error(
      `plugin-model: Invoking '${namespace || 'unknown'}' model failed:`,
      e,
    );
  }

  // 首次执行时立刻返回初始值
  useMemo(() => {
    updateRef.current(data);
  }, []);

  // React 16.13 后 update 函数用 useEffect 包裹
  useEffect(() => {
    if (initialLoad.current) {
      updateRef.current(data);
    } else {
      initialLoad.current = true;
    }
  });

  return null;
}

const dispatcher = new Dispatcher();

function Provider(props: {
  models: Record<string, any>;
  children: React.ReactNode;
}) {
  return (
    <Context.Provider value={{ dispatcher }}>
      {Object.keys(props.models).map((namespace) => {
        return (
          <Executor
            key={namespace}
            hook={props.models[namespace]}
            namespace={namespace}
            onUpdate={(val) => {
              dispatcher.data[namespace] = val;
              dispatcher.update(namespace);
            }}
          />
        );
      })}
      {props.children}
    </Context.Provider>
  );
}

function useModel(namespace: string, updater?: any) {
  const { dispatcher } = useContext<{ dispatcher: Dispatcher }>(Context);
  const updaterRef = useRef(updater);
  updaterRef.current = updater;
  const [state, setState] = useState(() =>
    updaterRef.current
      ? updaterRef.current(dispatcher.data[namespace])
      : dispatcher.data[namespace],
  );
  const stateRef = useRef<any>(state);
  stateRef.current = state;

  const isMount = useRef(false);
  useEffect(() => {
    isMount.current = true;
    return () => {
      isMount.current = false;
    };
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      if (!isMount.current) {
        // 如果 handler 执行过程中，组件被卸载了，则强制更新全局 data
        setTimeout(() => {
          dispatcher.data[namespace] = e;
          dispatcher.update(namespace);
        });
      } else {
        if (updater && updaterRef.current) {
          const currentState = updaterRef.current(e);
          const previousState = stateRef.current;
          if (!isEqual(currentState, previousState)) {
            setState(currentState);
          }
        } else {
          setState(e);
        }
      }
    };

    dispatcher.callbacks[namespace] ||= new Set();
    dispatcher.callbacks[namespace].add(handler);
    dispatcher.update(namespace);

    return () => {
      dispatcher.callbacks[namespace].delete(handler);
    };
  }, [namespace]);

  return state;
}

export default () => {
  return (
    <div>
      <h1>use model</h1>
      <Provider
        models={{
          count: () => {
            const [count, setCount] = useState(1);
            return {
              count: count,
              setCount,
            };
          },
        }}
      >
        <App />
      </Provider>
    </div>
  );
};

function App() {
  return (
    <div>
      <h2>App</h2>
      <Viewer />
      <Button />
    </div>
  );
}

function Viewer() {
  const { count } = useModel('count');
  return <p>COUNT: {count}</p>;
}

function Button() {
  const { setCount } = useModel('count');
  return (
    <button onClick={() => setCount((count: number) => count + 1)}>+</button>
  );
}
