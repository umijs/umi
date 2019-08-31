import * as React from 'react';
import { Button } from 'antd';
import { callRemote } from '@/socket';

const OpenFile: React.SFC<{}> = props => {
  const { onClick, actionType, path, type, children } = props;
  const handleClick = async () => {
    const projectPath = path || window.g_uiCurrentProject.path || '';
    await callRemote({
      type: actionType,
      payload: {
        projectPath,
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
