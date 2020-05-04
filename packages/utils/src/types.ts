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

export interface Route extends MenuDataItem {
  routes?: Route[];
}

export interface MessageDescriptor {
  id: any;
  description?: string;
  defaultMessage?: string;
}

export interface MenuDataItem {
  children?: MenuDataItem[];
  hideChildrenInMenu?: boolean;
  hideInMenu?: boolean;
  icon?: React.ReactNode;
  locale?: string | false;
  name?: string;
  key?: string;
  parentKeys?: string[];
  path?: string;
  [key: string]: any;
}

export type PartialProps<T> = Pick<T, PartialKeys<T>>;

export type NodeEnv = 'development' | 'production' | 'test';

export type Omit<T, U> = Pick<T, Exclude<keyof T, U>>;
