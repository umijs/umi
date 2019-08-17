import React from 'react';
import { Form, Input, Button } from 'antd';
import { MinusCircle, Plus } from '@ant-design/icons';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const StringArrayComp: React.SFC<ICompProps> = props => {
  const { name, description, form, title } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const label = <Label name={name} title={title} description={description} />;

  const formControl = (fields, { add, remove }) => {
    console.log('field', fields);
    return (
      <Form.Item label={label}>
        {fields.map((field, index) => (
          <Form.Item key={field.key} required={false}>
            <Form.Item
              {...field}
              validateTrigger={['onChange', 'onBlur']}
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: '请填写配置',
                },
              ]}
              noStyle
            >
              <Input defaultValue="" style={{ width: 320, marginRight: 8 }} />
            </Form.Item>
            {fields.length > 0 ? (
              <MinusCircle
                onClick={() => {
                  remove(field.name);
                }}
              />
            ) : null}
          </Form.Item>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            ghost
            onClick={() => {
              add();
            }}
            style={{ width: 320 }}
          >
            <Plus /> 添加一列
          </Button>
        </Form.Item>
      </Form.Item>
    );
  };

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
        console.log('getFieldValue(parentConfig', getFieldValue(parentConfig));
        const parentValue = getFieldValue(parentConfig);
        const isShow =
          typeof parentValue === 'undefined' || (typeof parentValue === 'boolean' && !!parentValue);
        return isShow && <Form.List name={name}>{formControl}</Form.List>;
      }}
    </Form.Item>
  ) : (
    <Form.List name={name}>{formControl}</Form.List>
  );
};

export default StringArrayComp;
