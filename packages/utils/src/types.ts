export type ArgsType<T extends (...args: any[]) => any> = T extends (
  ...args: infer U
) => any
  ? U
  : never;

export type PartialKeys<T> = Exclude<
  {
    [U in keyof T]: undefined extends T[U] ? U : never;
  }[keyof T],
  undefined
>;

export type PartialProps<T> = Pick<T, PartialKeys<T>>;

export type NodeEnv = 'development' | 'production' | 'test';

export type Omit<T, U> = Pick<T, Exclude<keyof T, U>>;
