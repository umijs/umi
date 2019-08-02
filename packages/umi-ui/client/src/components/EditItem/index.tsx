import * as React from 'react';
import { Icon, Tooltip, Input } from 'antd';
import cls from 'classnames';

import styles from './index.less';

const { useState, useEffect } = React;

interface EditItemProps {
  children: string;
  title?: string;
  onClick: (val: string) => void;
  className?: string;
}

const EditItem: React.SFC<EditItemProps> = props => {
  const { children = '', title = '编辑', onClick, className } = props;

  const [isEdit, setEdit] = useState<boolean>(false);
  const [editVal, setEditValue] = useState<string>(children);

  if (!children) return null;
  const handleChange = e => {
    const { value } = e.target;
    setEditValue(value);
  };

  const handleClose = () => {
    setEdit(false);
    setEditValue(children);
  };

  const handleClick = () => {
    try {
      onClick(editVal);
      setEdit(false);
    } catch (e) {
      setEditValue(children);
    }
  };

  const textCls = cls(styles.text, className);

  return (
    <span className={textCls}>
      {isEdit ? (
        <>
          <Input defaultValue={children} onChange={handleChange} />
          <Icon type="check" onClick={handleClick} />
          <Icon type="close" onClick={handleClose} />
        </>
      ) : (
        <>
          {children}
          <Tooltip title={title}>
            <Icon type="edit" onClick={() => setEdit(true)} />
          </Tooltip>
        </>
      )}
    </span>
  );
};

export default EditItem;
