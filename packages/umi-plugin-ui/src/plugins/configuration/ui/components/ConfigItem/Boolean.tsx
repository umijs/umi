import * as React from 'react';
import { Form, Switch } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import Context from '../../Context';
import { getFormItemShow } from './utils';

const BooleanComp: React.SFC<ICompProps> = props => {
  const { name, description, title } = props;
  const { debug: _log } = React.useContext(Context);
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} />,
    valuePropName: 'checked',
  };
  return parentConfig ? (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]}>
      {({ getFieldValue }) => {
        _log(
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
