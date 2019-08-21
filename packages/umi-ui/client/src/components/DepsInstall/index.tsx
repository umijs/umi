import * as React from 'react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib/button';

import styles from './index.less';

const { useState, useEffect } = React;

export interface DepsInstallProps {
  type?: 'install' | 'reinstall';
  path?: string;
  npmClient?: boolean;
  onProgress?: (data: any) => void;
}

const DepsInstallBtn: React.SFC<DepsInstallProps & ButtonProps> = props => {
  const { children, type, path, onClick, npmClient, onProgress, ...restProps } = props;
  const [loading, setLoading] = useState<boolean>(false);
  const projectPath = path || window.g_uiCurrentProject.path || '';

  const handleClick = () => {
    if (npmClient) {
      // show modal
    }
  };

  return (
    <>
      <Button {...restProps} onClick={handleClick} loading={loading}>
        {children}
      </Button>
    </>
  );
};

export default DepsInstallBtn;
