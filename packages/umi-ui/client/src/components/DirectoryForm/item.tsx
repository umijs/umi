import * as React from 'react';
import { FolderFilled, CheckOutlined } from '@ant-design/icons';
import cls from 'classnames';
import { IDirectoryType } from '@/enums';
import debug from '@/debug';

import styles from './index.less';

export interface DirectoryItemProps {
  fileName: string;
  type: keyof typeof IDirectoryType;
  clicked?: boolean;
  onClick: (name: string) => void;
  onDoubleClick: (name: string) => void;
}

const DirectoryItem: React.SFC<DirectoryItemProps> = props => {
  const _log = debug.extend('DirectoryItem');
  const { onClick, fileName, onDoubleClick, clicked } = props;
  const itemCls = cls(styles['directoryForm-list-item'], {
    [styles['directoryForm-list-item-active']]: !!clicked,
  });
  const foldIconCls = cls(
    styles['directoryForm-list-item-icon'],
    styles['directoryForm-item-icon-folder'],
  );

  const iconCls = cls(styles['directoryForm-list-item-checked-icon'], {
    [styles['checked-icon-active']]: !!clicked,
  });
  // Double Click
  const handleDoubleClick = () => {
    _log('handleDoubleClick fileName', fileName);
    onDoubleClick(fileName);
  };
  // onClick
  const handleClick = () => {
    onClick(fileName);
  };
  return (
    <div className={itemCls} onDoubleClick={handleDoubleClick} onClick={handleClick}>
      <FolderFilled className={foldIconCls} />
      <div className={styles['directoryForm-list-item-name']}>{fileName}</div>
      <CheckOutlined className={iconCls} />
    </div>
  );
};

export default DirectoryItem;
