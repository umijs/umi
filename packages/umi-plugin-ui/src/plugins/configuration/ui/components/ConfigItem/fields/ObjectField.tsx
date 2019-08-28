import React from 'react';
import { Button } from 'antd';
import cls from 'classnames';
import { Delete, Plus } from '@ant-design/icons';
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
  const { value, onChange, options: originOptions, defaultValue } = props;
  const [fieldsValue, setFieldsValue] = useState<IValue[]>(objToArray(value));
  const getOptionalOptions = () => {
    const newOptions = originOptions.map(option => ({
      ...option,
      disabled: !!arrayToObj(fieldsValue)[option.value],
    }));
    console.log('newOptions', newOptions);
    return newOptions;
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
      field[field.length] = { undefined: 0 };
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
        console.log('valvalueue', value);
        const [fieldKey] = Object.keys(field);
        console.log('fieldKey in defaultValue', fieldKey in defaultValue);
        const isRequired = fieldKey in defaultValue;
        const fieldObjCls = cls(styles['itemField-obj'], {
          [styles['itemField-obj-required']]: isRequired,
        });
        return (
          <div className={styles.itemField} key={fieldKey}>
            <ObjectItemField
              className={fieldObjCls}
              value={field}
              disabled={isRequired}
              onChange={v => handleChange(v, i)}
              options={options.map(option => ({
                ...option,
                disabled: Object.keys(value).includes(option.value),
              }))}
              setOptions={setOptions}
            />
            {!isRequired && (
              <Delete className={styles['itemField-icon']} onClick={() => handleRemove(i)} />
            )}
          </div>
        );
      })}
      {fieldsValue.length < options.length && (
        <Button
          type="dashed"
          ghost
          block
          className={styles.addBtn}
          onClick={handleAdd}
          style={{
            width: 'calc(100% - 22px)',
          }}
        >
          <Plus /> 添加一列
        </Button>
      )}
    </span>
  );
};

export default ObjectField;
