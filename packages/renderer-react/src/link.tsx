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
  const appData = useAppData();
  const to = typeof props.to === 'string' ? props.to : props.to.pathname;
  return (
    <Link
      onMouseEnter={() => props.prefetch && to && appData.preloadRoute?.(to)}
      {...props}
    >
      {props.children}
    </Link>
  );
}
