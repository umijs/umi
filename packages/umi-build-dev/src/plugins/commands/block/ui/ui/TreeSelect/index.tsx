import React, { useState } from 'react';
import { Tree, Select } from 'antd';
import { TreeProps } from 'antd/es/tree';

import styles from './index.module.less';

interface Props extends TreeProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const TreeSelect: React.FC<Props> = props => {
  const { value, placeholder, onChange } = props;
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
            selectedKeys={value ? [value] : []}
            onSelect={(_, { node }) => onChange && onChange(node.value)}
            {...props}
          />
        );
      }}
    />
  );
};

export default TreeSelect;
