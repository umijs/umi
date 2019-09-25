import React, { useState, useRef } from 'react';
import { Tree, Select } from 'antd';
import { TreeProps, AntTreeNodeProps } from 'antd/es/tree';

import styles from './index.module.less';

interface Props extends TreeProps {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

const TreeSelect: React.FC<Props> = props => {
  const { value, placeholder, onChange } = props;
  const ref = useRef();
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
      }}
    >
      <Select
        getPopupContainer={() => ref.current || document.body}
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
              onSelect={(_, { node }: { node: AntTreeNodeProps }) => {
                if (onChange) {
                  onChange(node.value);
                }
              }}
              {...props}
            />
          );
        }}
      />
    </div>
  );
};

export default TreeSelect;
