import React, { useRef } from 'react';
import { TreeSelect, Input } from 'antd';
import { TreeSelectProps } from 'antd/es/tree-select';

export interface CustomTreeSelectProps extends TreeSelectProps<any> {
  value?: string;
  onlySelectLeaf?: boolean;
  onChange?: (value: string) => void;
}
const InputGroup = Input.Group;

const CustomTreeSelect: React.FC<CustomTreeSelectProps> = props => {
  const { value = '', onChange: propOnChange, onlySelectLeaf, ...restProps } = props;
  const ref = useRef();

  const onChange = (path: string, fileName: string) => {
    propOnChange(`${path}/${fileName}`.replace(/\/\//g, '/'));
  };
  const fileArray = value.split('/');

  const name = fileArray.pop();
  const filePath = fileArray.join('/') || '/';
  const realValue = onlySelectLeaf ? value : filePath;

  const selectDom = (
    <TreeSelect
      showSearch
      style={{ width: onlySelectLeaf ? '100%' : '30%' }}
      dropdownStyle={{
        backgroundColor: '#23232e',
      }}
      labelInValue
      dropdownMatchSelectWidth={onlySelectLeaf ? undefined : 400}
      value={{
        value: realValue,
      }}
      // 不加这个不会跟着进度条走
      getPopupContainer={() => ref.current || document.body}
      onSelect={(_, node) => {
        if (onlySelectLeaf) {
          propOnChange(node.value as string);
          return;
        }
        if (onChange) {
          onChange(node.value as string, name);
        }
      }}
      {...restProps}
    />
  );
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
      }}
    >
      {onlySelectLeaf ? (
        selectDom
      ) : (
        <InputGroup compact>
          {selectDom}
          <Input
            style={{ width: '70%' }}
            value={name}
            onChange={e => {
              onChange(filePath, e.target.value);
            }}
          />
        </InputGroup>
      )}
    </div>
  );
};

export default CustomTreeSelect;
