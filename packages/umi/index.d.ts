import { Dispatch, AnyAction } from 'redux';
import ImportRouterTypes from './routerTypes';

export { default as Link } from './link';
export { default as NavLink } from './navlink';
export { default as Redirect } from './redirect';

export { default as dynamic } from './dynamic';
export { default as router } from './router';
export { default as Route } from './Route';
export { default as withRouter } from './withRouter';

export { default as UmiUIFlag } from './UmiUIFlag';

/**
 * T = props
 * U = you need params
 */
export type RouteComponent<T = {}, U = {}> = React.FC<
  T &
    Partial<ImportRouterTypes> & {
      dispatch: Dispatch<AnyAction>;
      params?: Partial<U>;
    }
>;

/**
 * RouteComponent by umi
 * T = props
 * U = you need params
 */
export type RC<T, U> = RouteComponent<T, U>;

export type RouterTypes = ImportRouterTypes;

// @ts-ignore
export * from '@@/umiExports';
