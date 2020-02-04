import * as React from 'react';
import { Button } from 'antd';
import { parse } from 'qs';
import { callRemote } from '@/socket';

const OpenFile: React.SFC<{}> = props => {
  const { onClick, actionType, path, type, children } = props;
  const handleClick = async () => {
    const projectPath = path || window.g_uiCurrentProject.path || '';
    const { key = '' } = parse(window.location.search, { ignoreQueryPrefix: true });
    await callRemote({
      type: actionType,
      payload: {
        projectPath,
        key,
      },
    });
    if (onClick) {
      onClick();
    }
  };
  return (
    <Button type={type} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default OpenFile;
