import type { History } from 'history';
import React, { PropsWithChildren, useLayoutEffect } from 'react';
import {
  Link,
  LinkProps,
  UNSAFE_LocationContext,
  UNSAFE_NavigationContext,
} from 'react-router-dom';
import { useAppData } from './appContext';
import { useIntersectionObserver } from './useIntersectionObserver';

function useForwardedRef<T>(ref?: React.ForwardedRef<T>) {
  const innerRef = React.useRef<T>(null);
  React.useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });
  return innerRef;
}

function keepPathLocal(path: string) {
  // A leading dot segment preserves the path when the browser resolves the URL.
  return path.startsWith('//') ? `/.${path}` : path;
}

export const LinkWithPrefetch = React.forwardRef(
  (
    props: PropsWithChildren<
      {
        prefetch?: boolean | 'intent' | 'render' | 'viewport' | 'none';
        prefetchTimeout?: number;
      } & LinkProps &
        React.RefAttributes<HTMLAnchorElement>
    >,
    forwardedRef,
  ) => {
    const { prefetch: prefetchProp, ...linkProps } = props;
    const { defaultPrefetch, defaultPrefetchTimeout } = (typeof window !==
      'undefined' && // @ts-ignore
      window.__umi_route_prefetch__) || {
      defaultPrefetch: 'none',
      defaultPrefetchTimeout: 50,
    };

    const prefetch =
      (prefetchProp === true
        ? 'intent'
        : prefetchProp === false
        ? 'none'
        : prefetchProp) || defaultPrefetch;
    if (!['intent', 'render', 'viewport', 'none'].includes(prefetch)) {
      throw new Error(
        `Invalid prefetch value ${prefetch} found in Link component`,
      );
    }
    const appData = useAppData();
    const location = React.useContext(UNSAFE_LocationContext)?.location;
    const navigation = React.useContext(UNSAFE_NavigationContext);
    const to = typeof props.to === 'string' ? props.to : props.to?.pathname;
    const hasRenderFetched = React.useRef(false);
    const ref = useForwardedRef(forwardedRef);
    // prefetch intent
    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch !== 'intent' || !to) return;
      const eventTarget = (e.target || {}) as HTMLElement & {
        preloadTimeout?: NodeJS.Timeout | null;
      };
      if (eventTarget.preloadTimeout) return;
      eventTarget.preloadTimeout = setTimeout(() => {
        eventTarget.preloadTimeout = null;
        appData.preloadRoute?.(to);
      }, props.prefetchTimeout || defaultPrefetchTimeout);
    };
    const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch !== 'intent') return;
      const eventTarget = (e.target || {}) as HTMLElement & {
        preloadTimeout?: NodeJS.Timeout | null;
      };
      if (eventTarget.preloadTimeout) {
        clearTimeout(eventTarget.preloadTimeout);
        eventTarget.preloadTimeout = null;
      }
    };

    // prefetch render
    useLayoutEffect(() => {
      if (prefetch === 'render' && to && !hasRenderFetched.current) {
        appData.preloadRoute?.(to);
        hasRenderFetched.current = true;
      }
    }, [prefetch, to]);

    // prefetch viewport
    useIntersectionObserver(
      ref as React.RefObject<HTMLAnchorElement>,
      (entry) => {
        if (entry?.isIntersecting && to) {
          appData.preloadRoute?.(to);
        }
      },
      { rootMargin: '100px' },
      { disabled: prefetch !== 'viewport' || !to },
    );

    // compatible with old code
    // which to might be undefined
    if (!props.to) return null;

    const link = (
      <Link
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        {...linkProps}
      >
        {props.children}
      </Link>
    );

    const inheritsPath =
      typeof props.to === 'string'
        ? /^[?#]/.test(props.to)
        : props.to.pathname == null;
    if (
      !inheritsPath ||
      !location?.pathname.startsWith('//') ||
      navigation?.basename !== '/'
    ) {
      return link;
    }

    const { navigator } = navigation;
    const { pathname } = location;
    // BrowserRouter uses the document location. Memory history exposes an index.
    const usesBrowserHistory =
      typeof window !== 'undefined' &&
      window.location.pathname === pathname &&
      (navigator as Partial<History>).location?.pathname === pathname &&
      !('index' in navigator) &&
      navigator.createHref({ pathname }).startsWith('//');
    const keepTargetLocal = (target: Parameters<History['push']>[0]) =>
      usesBrowserHistory &&
      typeof target !== 'string' &&
      target.pathname === pathname
        ? { ...target, pathname: keepPathLocal(pathname) }
        : target;

    return (
      <UNSAFE_NavigationContext.Provider
        value={{
          ...navigation,
          navigator: {
            go: navigator.go.bind(navigator),
            push: (target, state) =>
              navigator.push(keepTargetLocal(target), state),
            replace: (target, state) =>
              navigator.replace(keepTargetLocal(target), state),
            createHref: (target) => keepPathLocal(navigator.createHref(target)),
          },
        }}
      >
        {link}
      </UNSAFE_NavigationContext.Provider>
    );
  },
);
