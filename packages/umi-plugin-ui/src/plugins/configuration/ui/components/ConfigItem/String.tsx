import React from 'react';
import { Form, Input } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const StringComp: React.SFC<ICompProps> = props => {
  const { name, description, form, title } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} />,
  };

  const formControl = <Input style={{ maxWidth: 320 }} />;

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
        return (
          !!getFieldValue(parentConfig) && (
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
