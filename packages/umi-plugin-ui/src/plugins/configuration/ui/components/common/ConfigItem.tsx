import React, { useEffect, useState, useContext } from 'react';
import { Input, Form, Select, Switch } from 'antd';
import styles from './ConfigItem.less';

const FormItem = Form.Item;
const { Option } = Select;

const ConfigItem = props => {
  const { item, editHandler } = props;
  let value = item.default;
  if ('value' in item) {
    value = item.value;
  }

  return (
    <div className={styles.configItem}>
      <h3>{item.title || item.name}</h3>
      {item.type === 'list' && (
        <div>
          <Select
            style={{ minWidth: 100 }}
            defaultValue={value}
            onChange={v => editHandler(item.name, v)}
          >
            {item.choices.map(choice => {
              return (
                <Option key={choice} value={choice}>
                  {choice}
                </Option>
              );
            })}
          </Select>
        </div>
      )}
      {item.type === 'string' && (
        <div>
          <Input defaultValue={value} onBlur={e => editHandler(item.name, `${e.target.value}`)} />
        </div>
      )}
      {item.type === 'boolean' && (
        <div>
          <Switch checked={value} onChange={vv => editHandler(item.name, `${vv}`)} />
        </div>
      )}
      {item.type === 'object' && <div>object</div>}
      <div>{item.description}</div>
    </div>
  );
};

export default ConfigItem;
