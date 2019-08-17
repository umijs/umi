import React from 'react';
import { Button } from 'antd';
import { MinusCircle, Plus } from '@ant-design/icons';
import ObjectItemField, { IValue, ObjectItemFieldProps, IOption } from './ObjectItemField';

import styles from './styles.module.less';

const { useState } = React;

const objToArray = (v: IValue): IValue[] => {
  return Object.keys(v).map(k => ({ [k]: v[k] }));
};

const arrayToObj = (arr: IValue[]): IValue => {
  return arr.reduce(
    (acc, curr) => ({
      ...acc,
      ...curr,
    }),
    {},
  );
};

const ObjectField: React.FC<ObjectItemFieldProps> = props => {
  const { value, onChange, options: originOptions } = props;
  const [fieldsValue, setFieldsValue] = useState<IValue[]>(objToArray(value));
  const getOptionalOptions = () => {
    return originOptions.map(option => ({
      ...option,
      disabled: !!arrayToObj(fieldsValue)[option.value],
    }));
  };
  const [options, setOptions] = useState<IOption[]>(getOptionalOptions());

  const triggerChange = changedValue => {
    if (onChange) {
      console.log('changedValue', changedValue);
      onChange({ ...arrayToObj(fieldsValue), ...changedValue });
    }
  };

  const handleChange = (v: IValue, index: number) => {
    setFieldsValue(field => {
      field[index] = v;
      return field;
    });
    setOptions(getOptionalOptions());
    triggerChange(v);
  };

  console.log('fieldsValue', fieldsValue);

  const handleAdd = () => {
    setFieldsValue(field => {
      const lastField = field[field.length - 1];
      field[field.length] = lastField;
      return field;
    });
    triggerChange({});
  };

  const handleRemove = index => {
    setFieldsValue(field => {
      const tmpField = field;
      tmpField.splice(index, 1);
      return tmpField;
    });
    triggerChange({});
  };

  return (
    <span>
      {fieldsValue.map((field, i) => {
        return (
          <div className={styles.itemField} key={i.toString()}>
            <ObjectItemField
              className={styles['itemField-obj']}
              value={field}
              onChange={v => handleChange(v, i)}
              options={options}
              setOptions={setOptions}
            />
            {fieldsValue.length > 1 && (
              <MinusCircle className={styles['itemField-icon']} onClick={() => handleRemove(i)} />
            )}
          </div>
        );
      })}
      <Button
        type="dashed"
        ghost
        block
        onClick={handleAdd}
        style={{
          width: 'calc(100% - 22px)',
        }}
      >
        <Plus /> 添加一列
      </Button>
    </span>
  );
};

export default ObjectField;
