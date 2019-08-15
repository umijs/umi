import * as React from 'react';
import { Form, Switch } from 'antd';
import { ICompProps } from './index';

const BooleanComp: React.SFC<ICompProps> = props => {
  const { name, description, default: defaultValue, form } = props;
  // exportStatic.htmlSuffix => exportStatic
  const [parentConfig] = name.split('.');
  const parentValue = form.getFieldValue(parentConfig);
  const defaultChecked = !!(defaultValue as string);
  return (
    parentConfig &&
    !!parentValue && (
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
