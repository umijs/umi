import * as React from 'react';
import { Input, Select, InputNumber, Divider } from 'antd';
import { Plus } from '@ant-design/icons';
import styles from './styles.module.less';

const { Group: InputGroup } = Input;
const { Option } = Select;

const { useState } = React;

export interface IValue {
  [key: string]: number | string | boolean;
}

export interface IOption {
  name: string;
  value: string;
  icon?: string;
  disabled?: boolean;
}

export interface ObjectItemFieldProps {
  value: IValue;
  options: IOption[];
  disabled?: boolean;
  defaultValue?: IValue;
  disableOptionsExtend?: boolean;
  setOptions?: () => void;
  onChange: (value: IValue) => void;
  className?: string;
}

const iconMappings = {
  chrome: '//gw.alipayobjects.com/zos/antfincdn/zULbAV%247Fu/chrome.svg',
  safari: '//gw.alipayobjects.com/zos/antfincdn/p%265wMrlwHp/safari.svg',
  firefox: '//gw.alipayobjects.com/zos/antfincdn/LgT4w0BJmf/firefox.svg',
  default: '//gw.alipayobjects.com/zos/antfincdn/csBs0WwXwN/default.svg',
};

const ObjectItemField: React.SFC<ObjectItemFieldProps> = props => {
  const { options, value, onChange, className, disableOptionsExtend = true, disabled } = props;
  const [fieldValue, setFieldValue] = useState<IValue>(value);
  const [[k, v]] = Object.entries(fieldValue);

  const triggerChange = changedValue => {
    if (onChange) {
      onChange(changedValue);
    }
  };

  const handleSelect = (key: string) => {
    const val = {
      [key]: v,
    };
    setFieldValue(val);
    triggerChange(val);
  };

  const handleInput = (vv: IValue) => {
    const val = {
      [k]: vv,
    };
    setFieldValue(val);
    triggerChange(val);
  };

  const dropdownRender = disableOptionsExtend
    ? menu => (
        <div>
          {menu}
          <Divider style={{ margin: '4px 0' }} />
          <div style={{ padding: '8px', cursor: 'pointer' }}>
            <Plus /> 添加
          </div>
        </div>
      )
    : null;

  return (
    <InputGroup compact style={{ marginBottom: 8, display: 'flex' }} className={className}>
      <Select
        style={{ minWidth: 120 }}
        value={options.find(option => k === option.value) ? k : undefined}
        disabled={disabled}
        getPopupContainer={triggerNode => triggerNode.parentNode}
        onChange={handleSelect}
        placeholder="请选择"
      >
        {Array.isArray(options) &&
          options.map(option => (
            <Option key={`${option.value}`} value={option.value} disabled={option.disabled}>
              {option.icon && <img src={iconMappings[option.icon]} style={{ marginRight: 4 }} />}
              {option.name}
            </Option>
          ))}
      </Select>
      <div className={styles['itemField-field-value']}>
        {/* {typeof v === 'string' && (
          <Input autoComplete="off" onChange={e => handleInput(e.target.value)} defaultValue={v} />
        )} */}
        <InputNumber onChange={v => handleInput(v)} defaultValue={v} />
      </div>
    </InputGroup>
  );
};

export default ObjectItemField;
