import React, { PropsWithChildren } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAppData } from './appContext';

export function LinkWithPrefetch(
  props: PropsWithChildren<
    {
      prefetch?: boolean;
    } & LinkProps &
      React.RefAttributes<HTMLAnchorElement>
  >,
) {
  const { prefetch, ...linkProps } = props;
  const appData = useAppData();
  const to = typeof props.to === 'string' ? props.to : props.to?.pathname;
  // compatible with old code
  // which to might be undefined
  if (!to) return null;
  return (
    <Link
      onMouseEnter={() => prefetch && to && appData.preloadRoute?.(to)}
      {...linkProps}
    >
      {props.children}
    </Link>
  );
}
