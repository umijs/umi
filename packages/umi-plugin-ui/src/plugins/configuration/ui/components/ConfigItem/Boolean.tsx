import * as React from 'react';
import { Form, Switch } from 'antd';
import { ICompProps } from './index';
import { getFormItemShow } from './utils';

const BooleanComp: React.SFC<ICompProps> = props => {
  const { name, description, default: defaultValue, form } = props;
  const defaultChecked = !!(defaultValue as string);
  const [shouldShow, parentConfig] = getFormItemShow(name, form);

  return (
    shouldShow && (
      <Form.Item
        name={name}
        label={name}
        defaultChecked={defaultChecked}
        dependencies={parentConfig ? [parentConfig] : []}
        help={description}
      >
        <Switch />
      </Form.Item>
    )
  );
};

export default BooleanComp;
