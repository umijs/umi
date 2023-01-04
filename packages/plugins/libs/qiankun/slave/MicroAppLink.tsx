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
import {
  qiankunStateFromMasterModelNamespace,
  defaultHistoryType,
} from './constants';

const COMPONENT_NAME = 'qiankun-microapp-link';

interface MicroAppLinkProps {
  // 应用名称
  name?: string;

  // 相对路由，不包含应用前缀，以为 `/` 开头
  to: string;

  // 是否主应用下的路由，默认false
  isMaster?: boolean;
}

const urlFactory =
  (base: string, routes: Record<string, any>[]) =>
  ({ name, to, isMaster }: MicroAppLinkProps) => {
    if (isMaster) {
      return to;
    }

    if (!to?.startsWith('/')) {
      throw new Error(`[${COMPONENT_NAME}] props "to" should start with "/"`);
    }

    const app = find(routes, ({ microApp }) => microApp === name);
    if (!app) {
      console.error(`[${COMPONENT_NAME}] microapp "${name}" is not found`);
      return to;
    }

    const prefix =
      base === '/'
        ? app.path.replace('/*', '')
        : `${base}${app.path.replace('/*', '')}`;
    return `${prefix}${to}`;
  };

export const MicroAppLink: FC<
  MicroAppLinkProps & HTMLAttributes<HTMLAnchorElement>
> = forwardRef((props, ref) => {
  const { children, name, to, isMaster = false, ...anchorProps } = props;
  const stateFromMaster = (useModel || noop)(
    qiankunStateFromMasterModelNamespace,
  );
  const linkRef = useRef<HTMLAnchorElement>();

  const {
    masterHistoryType,
    microAppRoutes,
    base,
    appNameKeyAlias = 'name',
  } = stateFromMaster?.__globalRoutesInfo || {};
  // ref: https://github.com/umijs/plugins/pull/866 基于 name 或 appNameKeyAlias 取到 appName 的逻辑
  const appName =
    name && props[appNameKeyAlias] ? name : props[appNameKeyAlias] || name;

  const linkProps = { name: appName, to, isMaster };
  const createHerf = urlFactory(base, microAppRoutes);

  const linkUrl =
    masterHistoryType === 'browser'
      ? createHerf(linkProps)
      : `#${createHerf(linkProps)}`;

  useImperativeHandle(ref, () => linkRef.current);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (anchorProps.onClick) {
        return anchorProps.onClick(e);
      }

      // hash路由 使用 a标签 默认行为
      if (masterHistoryType === 'hash') {
        return;
      }

      if (masterHistoryType === 'browser') {
        e?.stopPropagation();
        e?.preventDefault();
        return window.history.pushState({}, '', linkUrl);
      }

      console.error(
        `[${COMPONENT_NAME}] not support "masterHistoryType = '${masterHistoryType}'"`,
      );
      return;
    },
    [anchorProps.onClick, masterHistoryType],
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
