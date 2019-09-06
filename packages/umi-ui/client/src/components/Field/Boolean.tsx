import * as React from 'react';
import { Form, Switch } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const BooleanComp: React.SFC<ICompProps> = props => {
  const _log = g_uiDebug.extend('Field:BooleanComp');
  debugger;
  const { name, description, title, link } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} link={link} />,
    valuePropName: 'checked',
  };

  return parentConfig ? (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]}>
      {({ getFieldValue }) => {
        _log(
          'BooleanComp children field update',
          name,
          parentConfig,
          getFieldValue(name),
          getFieldValue(parentConfig),
        );
        const parentValue = getFieldValue(parentConfig);
        const isShow = typeof parentValue === 'undefined' || !!parentValue;
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
