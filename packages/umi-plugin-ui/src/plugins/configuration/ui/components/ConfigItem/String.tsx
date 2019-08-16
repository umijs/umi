import * as React from 'react';
import { Form, Input } from 'antd';
import { ICompProps } from './index';
import { getFormItemShow } from './utils';

const StringComp: React.SFC<ICompProps> = props => {
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
        <Input />
      </Form.Item>
    )
  );
};

export default StringComp;
