import React, { PropsWithChildren, useLayoutEffect } from 'react';
import { Link, LinkProps } from 'react-router-dom';
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
    const to = typeof props.to === 'string' ? props.to : props.to?.pathname;
    const hasRenderFetched = React.useRef(false);
    const ref = useForwardedRef(forwardedRef);
    // prefetch intent
    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (prefetch !== 'intent') return;
      const eventTarget = (e.target || {}) as HTMLElement & {
        preloadTimeout?: NodeJS.Timeout | null;
      };
      if (eventTarget.preloadTimeout) return;
      eventTarget.preloadTimeout = setTimeout(() => {
        eventTarget.preloadTimeout = null;
        appData.preloadRoute?.(to!);
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
      if (prefetch === 'render' && !hasRenderFetched.current) {
        appData.preloadRoute?.(to!);
        hasRenderFetched.current = true;
      }
    }, [prefetch, to]);

    // prefetch viewport
    useIntersectionObserver(
      ref as React.RefObject<HTMLAnchorElement>,
      (entry) => {
        if (entry?.isIntersecting) {
          appData.preloadRoute?.(to!);
        }
      },
      { rootMargin: '100px' },
      { disabled: prefetch !== 'viewport' },
    );

    // compatible with old code
    // which to might be undefined
    if (!to) return null;

    return (
      <Link
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={ref as React.RefObject<HTMLAnchorElement>}
        {...linkProps}
      >
        {props.children}
      </Link>
    );
  },
);
