import { parse, UrlWithStringQuery } from 'url';
import { matchRoutes } from 'react-router-config';

import { IOpts } from './renderServer';

function addLeadingSlash(path: string): string {
  return path.charAt(0) === '/' ? path : '/' + path;
}

// from react-router
export function stripBasename(
  basename: string,
  path: string,
): UrlWithStringQuery {
  const location = parse(path);
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location?.pathname?.indexOf(base) !== 0) return location;
  const pathname = addLeadingSlash(location.pathname.substr(base.length));

  return {
    ...location,
    pathname,
  };
}

export interface ILoadGetInitialPropsValue {
  pageInitialProps: any;
}

interface ILoadGetInitialPropsOpts extends IOpts {
  App?: React.ReactElement;
}

/**
 * get current page component getPageInitialProps data
 * @param params
 */
export const loadGetInitialProps = async (
  opts: ILoadGetInitialPropsOpts,
): Promise<ILoadGetInitialPropsValue> => {
  const { routes, pathname, history } = opts;
  // via {routes} to find `getInitialProps`
  const matched = matchRoutes(routes, pathname || '/')
    .map(async ({ route, match }) => {
      // @ts-ignore
      const { component, ...restRouteParams } = route;

      if (component && component?.getInitialProps) {
        const ctx = {
          isServer: true,
          match,
          // server only
          history,
          ...(opts.getInitialPropsCtx || {}),
          ...restRouteParams,
        };
        const initialProps = component.getInitialProps
          ? await component.getInitialProps(ctx)
          : null;
        return initialProps;
      }
    })
    .filter(Boolean);
  const pageInitialProps = (await Promise.all(matched)).reduce(
    (acc, curr) => Object.assign({}, acc, curr),
    {},
  );

  return {
    pageInitialProps,
  };
};
