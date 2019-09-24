import React, { useState } from 'react';
import { Tree, Select } from 'antd';
import { TreeProps } from 'antd/es/tree';

import styles from './index.module.less';

interface Props extends TreeProps {
  value?: string;
  placeholder?: string;
}

const TreeSelect: React.FC<Props> = props => {
  const { value, placeholder } = props;
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Select
      style={{ width: '100%' }}
      value={value}
      onDropdownVisibleChange={setOpen}
      placeholder={placeholder}
      open={open}
      dropdownRender={() => {
        return (
          <Tree
            className={styles.tree}
            onClick={() => setOpen(false)}
            {...props}
            selectedKeys={value ? [value] : []}
          />
        );
      }}
    />
  );
};

export default TreeSelect;
