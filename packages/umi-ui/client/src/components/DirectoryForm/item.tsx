import * as React from 'react';
import { Icon } from 'antd';
import cls from 'classnames';
import { IDirectoryType } from '@/enums';

import styles from './index.less';

const { useState, useEffect } = React;

export interface DirectoryItemProps {
  fileName: string;
  type: keyof typeof IDirectoryType;
  onClick: (name: string) => void;
}

const DirectoryItem: React.SFC<DirectoryItemProps> = props => {
  const { onClick } = props;
  const foldIconCls = cls(
    styles['directoryForm-list-item-icon'],
    styles['directoryForm-item-icon-folder'],
  );
  const handleClick = () => {
    console.log('directory', props.fileName);
    onClick(props.fileName);
  };
  return (
    <div className={styles['directoryForm-list-item']} onClick={handleClick}>
      <Icon className={foldIconCls} type="folder" />
      <div className={styles['directoryForm-list-item-name']}>{props.fileName}</div>
    </div>
  );
};

export default DirectoryItem;
