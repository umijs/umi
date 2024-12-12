import React, { PropsWithChildren } from 'react';
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
  const prefetch = prefetchProp === true ? 'intent' : prefetchProp;
  const appData = useAppData();
  const to = typeof props.to === 'string' ? props.to : props.to?.pathname;

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
