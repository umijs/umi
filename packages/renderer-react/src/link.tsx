import React, { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from './appContext';

export function LinkWithPrefetch(
  props: PropsWithChildren<{
    prefetch?: boolean;
    to: string | Partial<{ pathname: string; search: string; hash: string }>;
    replace?: boolean;
    state?: boolean;
    reloadDocument?: boolean;
  }>,
) {
  const appData = useAppData();
  const to = typeof props.to === 'string' ? props.to : props.to.pathname;
  return (
    <Link
      onMouseEnter={() => props.prefetch && appData.preloadRoute(to)}
      to={props.to}
      replace={props.replace}
      state={props.state}
      reloadDocument={props.reloadDocument}
    >
      {props.children}
    </Link>
  );
}
