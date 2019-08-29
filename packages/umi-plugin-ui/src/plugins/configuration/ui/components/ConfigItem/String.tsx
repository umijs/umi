import React from 'react';
import { Form, Input } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const StringComp: React.SFC<ICompProps> = props => {
  const { name, description, title, default: defaultValue } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    required: false,
    label: <Label name={name} title={title} description={description} />,
    rules: [{ required: !!defaultValue, message: `请输入${title}` }],
  };

  const formControl = <Input autoComplete="off" style={{ maxWidth: 320 }} />;

  return parentConfig ? (
    <Form.Item shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]} noStyle>
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
              {formControl}
            </Form.Item>
          )
        );
      }}
    </Form.Item>
  ) : (
    <Form.Item {...basicItem}>{formControl}</Form.Item>
  );
};

export default StringComp;
