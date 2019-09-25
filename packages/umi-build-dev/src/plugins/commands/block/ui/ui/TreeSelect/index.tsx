import React, { useState, useRef } from 'react';
import { Tree, Input, Select } from 'antd';
import { TreeProps, AntTreeNodeProps } from 'antd/es/tree';

import styles from './index.module.less';

interface Props extends TreeProps {
  value?: string;
  placeholder?: string;
  selectable?: boolean;
  onChange?: (value: string) => void;
}
const InputGroup = Input.Group;

const TreeSelect: React.FC<Props> = props => {
  const { value, placeholder, onChange: propOnChange } = props;
  const ref = useRef();
  const [open, setOpen] = useState<boolean>(false);
  const onChange = (path: string, fileName: string) => {
    propOnChange(`${path}/${fileName}`.replace(/\/\//g, '/'));
  };
  const fileArray = value.split('/');

  const name = fileArray.pop();
  const filePath = fileArray.join('/') || '/';
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
      }}
    >
      <InputGroup compact>
        <Select
          style={{ width: '50%' }}
          getPopupContainer={() => ref.current || document.body}
          value={filePath}
          onDropdownVisibleChange={setOpen}
          placeholder={placeholder}
          open={open}
          dropdownRender={() => (
            <Tree
              className={styles.tree}
              onClick={() => setOpen(false)}
              selectedKeys={filePath ? [filePath] : []}
              onSelect={(_, { node }: { node: AntTreeNodeProps }) => {
                if (onChange) {
                  onChange(node.value, name);
                }
              }}
              {...props}
            />
          )}
        />

        <Input
          style={{ width: '50%' }}
          value={name}
          onChange={e => {
            onChange(filePath, e.target.value);
          }}
        />
      </InputGroup>
    </div>
  );
};

export default TreeSelect;
