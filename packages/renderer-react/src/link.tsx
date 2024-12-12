import React, { PropsWithChildren, useLayoutEffect } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAppData } from './appContext';

export function LinkWithPrefetch(
  props: PropsWithChildren<
    {
      prefetch?: boolean | 'intent' | 'render' | 'viewport' | 'none';
    } & LinkProps &
      React.RefAttributes<HTMLAnchorElement>
  >,
) {
  const { prefetch: prefetchProp, ...linkProps } = props;
  const prefetch =
    prefetchProp === true
      ? 'intent'
      : prefetchProp === false
      ? 'none'
      : prefetchProp;
  const appData = useAppData();
  const to = typeof props.to === 'string' ? props.to : props.to?.pathname;
  const hasRenderFetched = React.useRef(false);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (prefetch !== 'intent') return;
    const eventTarget = (e.target || {}) as HTMLElement & {
      preloadTimeout?: NodeJS.Timeout | null;
    };
    if (eventTarget.preloadTimeout) return;
    eventTarget.preloadTimeout = setTimeout(() => {
      eventTarget.preloadTimeout = null;
      appData.preloadRoute?.(to!);
    }, 50);
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

  useLayoutEffect(() => {
    if (prefetch === 'render' && !hasRenderFetched.current) {
      appData.preloadRoute?.(to!);
      hasRenderFetched.current = true;
    }
  }, [prefetch, to]);

  // compatible with old code
  // which to might be undefined
  if (!to) return null;

  return (
    <Link
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...linkProps}
    >
      {props.children}
    </Link>
  );
}
