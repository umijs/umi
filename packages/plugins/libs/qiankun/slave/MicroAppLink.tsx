// @ts-nocheck
/* eslint-disable */
__USE_MODEL__;
import React, {
  forwardRef,
  FC,
  useImperativeHandle,
  useRef,
  MouseEvent,
  HTMLAttributes,
  useCallback,
} from 'react';
import noop from 'lodash/noop';
import find from 'lodash/find';

const COMPONENT_NAME = 'qiankun-microapp-link';

interface MicroAppLinkProps {
  // 应用名称
  appName?: string;

  // 相对路由，不包含应用前缀
  appRoute: string;

  // 是否主应用下的路由，默认false
  isMaster?: boolean;
}

const urlFactory =
  (routes: Record<string, any>[]) =>
  ({ appName, appRoute, isMaster }: MicroAppLinkProps) => {
    if (isMaster) {
      return appRoute;
    }

    const app = find(routes, ({ microApp }) => microApp === appName);
    if (!app) {
      console.error(`[${COMPONENT_NAME}] microapp "${app}" is not found`);
      return appRoute;
    }

    const prefix = app.path.replace('/*', '');
    return `${prefix}/${
      appRoute.startsWith('/') ? appRoute.slice(1) : appRoute
    }`;
  };

export const MicroAppLink: FC<
  MicroAppLinkProps & HTMLAttributes<HTMLAnchorElement>
> = forwardRef((props, ref) => {
  const {
    children,
    appName,
    appRoute,
    isMaster = false,
    ...anchorProps
  } = props;
  const stateFromMaster = (useModel || noop)('@@qiankunStateFromMaster');
  const linkRef = useRef<HTMLAnchorElement>();

  const { historyType, routes } = stateFromMaster?.globalRoutesInfo || {};
  const linkProps = { appName, appRoute, isMaster };
  const createHerf = urlFactory(routes);
  const linkUrl =
    historyType === 'hash'
      ? `#${createHerf(linkProps)}`
      : createHerf(linkProps);

  useImperativeHandle(ref, () => linkRef.current);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (anchorProps.onClick) {
        return anchorProps.onClick(e);
      }

      // hash路由 使用 a标签 默认行为
      if (historyType === 'hash') {
        return;
      }

      if (historyType === 'browser') {
        e?.stopPropagation();
        e?.preventDefault();
        return window.history.pushState({}, '', linkUrl);
      }

      console.error(
        `[${COMPONENT_NAME}] not support "masterHistoryType = '${historyType}'"`,
      );
      return;
    },
    [anchorProps.onClick, historyType],
  );

  return (
    <a
      {...anchorProps}
      ref={linkRef}
      className={`${COMPONENT_NAME} ${anchorProps.className}`}
      href={linkUrl}
      onClick={handleClick}
    >
      {children}
    </a>
  );
});
