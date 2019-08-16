import * as React from 'react';
import { Form, Switch } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const BooleanComp: React.SFC<ICompProps> = props => {
  const { name, description, form } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const basicItem = {
    name,
    label: <Label name={name} description={description} />,
    valuePropName: 'checked',
  };
  return parentConfig ? (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]}>
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
              <Switch />
            </Form.Item>
          )
        );
      }}
    </Form.Item>
  ) : (
    <Form.Item {...basicItem}>
      <Switch />
    </Form.Item>
  );
};

export default BooleanComp;
