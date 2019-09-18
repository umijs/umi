import React from 'react';
import { Button, Popconfirm, Tooltip } from 'antd';
import cls from 'classnames';
import { Delete, Plus } from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import ObjectItemField, { IValue, ObjectItemFieldProps, IOption } from './ObjectItemField';
import { objToArray, arrayToObj } from '../utils';

import styles from './styles.module.less';

const { useState } = React;

const ObjectField: React.FC<ObjectItemFieldProps> = props => {
  const _log = g_uiDebug.extend('Field:ObjectField');
  const { value = {}, onChange, options: originOptions, defaultValue } = props;
  const [fieldsValue, setFieldsValue] = useState<IValue[]>(objToArray(value));
  const getOptionalOptions = () => {
    const newOptions = originOptions.map(option => ({
      ...option,
      disabled: !!arrayToObj(fieldsValue)[option.value],
    }));
    _log('newOptions', newOptions);
    return newOptions;
  };
  const [options, setOptions] = useState<IOption[]>(getOptionalOptions());

  const triggerChange = changedValue => {
    if (onChange) {
      _log('changedValue', changedValue);
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

  _log('fieldsValue', fieldsValue);

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
        _log('valvalueue', value);
        const [fieldKey] = Object.keys(field);
        _log('fieldKey in defaultValue', fieldKey in defaultValue);
        const isRequired = fieldKey in defaultValue;
        const fieldObjCls = cls(styles['itemField-obj'], {
          [styles['itemField-obj-required']]: isRequired,
        });
        return (
          <div className={styles.itemField} key={i.toString()}>
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
              <Popconfirm
                title={formatMessage({ id: 'org.umi.ui.configuration.object.item.delete.confirm' })}
                onConfirm={() => handleRemove(i)}
              >
                <Tooltip
                  title={formatMessage({
                    id: 'org.umi.ui.configuration.object.item.delete.tooltip',
                  })}
                >
                  <Delete className={styles['itemField-icon']} />
                </Tooltip>
              </Popconfirm>
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
            minWidth: fieldsValue.length === 0 ? '100%' : 'unset',
          }}
        >
          <Plus /> {formatMessage({ id: 'org.umi.ui.configuration.add.column' })}
        </Button>
      )}
    </span>
  );
};

export default ObjectField;
