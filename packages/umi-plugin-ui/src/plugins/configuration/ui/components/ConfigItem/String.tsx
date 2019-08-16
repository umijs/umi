import * as React from 'react';
import { Form, Input } from 'antd';
import { ICompProps } from './index';
import { getFormItemShow } from './utils';

const StringComp: React.SFC<ICompProps> = props => {
  const { name, description, form } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const basicItem = {
    name,
    label: name,
    help: description,
  };

  return parentConfig ? (
    <Form.Item shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]}>
      {({ getFieldValue }) => {
        console.log(
          'children field update',
          name,
          parentConfig,
          getFieldValue(name),
          getFieldValue(parentConfig),
        );
        return (
          !!getFieldValue(parentConfig) && (
            <Form.Item {...basicItem} dependencies={[parentConfig]}>
              <Input />
            </Form.Item>
          )
        );
      }}
    </Form.Item>
  ) : (
    <Form.Item {...basicItem}>
      <Input />
    </Form.Item>
  );
};

export default StringComp;
