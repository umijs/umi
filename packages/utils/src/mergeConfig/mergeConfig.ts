type AnyConfig<T extends Record<string, any>, U extends Record<string, any>> = {
  [V in keyof U]: V extends keyof T
    ? U[V] extends (...args: any[]) => any
      ? (argv: T[V]) => T[V]
      : T[V]
    : U[V];
};

type CalculatedConfig<
  T extends Record<string, any>,
  U extends Record<string, any>
> = T &
  {
    [V in keyof U]: V extends keyof T ? T[V] : U[V];
  };

export default function mergeConfig<
  T extends Record<string, any>,
  U extends Record<string, any>
>(defaultConfig: T, ...configs: (AnyConfig<T, U> | null | undefined)[]) {
  const ret = { ...defaultConfig } as Partial<CalculatedConfig<T, U>>;
  configs.forEach((config) => {
    if (!config) return;
    (Object.keys(config) as (keyof typeof config)[]).forEach((key) => {
      const val = config[key];
      if (typeof val === 'function') {
        ret[key] = val(ret[key]);
      } else {
        ret[key] = val as CalculatedConfig<T, U>[typeof key];
      }
    });
  });
  return ret as CalculatedConfig<T, U>;
}
