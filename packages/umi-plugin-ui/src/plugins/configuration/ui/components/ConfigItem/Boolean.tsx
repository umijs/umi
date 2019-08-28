import * as React from 'react';
import { Form, Switch } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const BooleanComp: React.SFC<ICompProps> = props => {
  const { name, description, title, form } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} />,
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
        const parentValue = getFieldValue(parentConfig);
        const isShow =
          typeof parentValue === 'undefined' || (typeof parentValue === 'boolean' && !!parentValue);
        return (
          isShow && (
            <Form.Item {...basicItem} dependencies={[parentConfig]}>
              <Switch size="small" />
            </Form.Item>
          )
        );
      }}
    </Form.Item>
  ) : (
    <Form.Item {...basicItem}>
      <Switch size="small" />
    </Form.Item>
  );
};

export default BooleanComp;
