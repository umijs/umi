import React from 'react';
import { Form, Input, Button } from 'antd';
import { MinusCircle, Plus } from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import { FieldProps } from './index';
import debug from '@/debug';
import { getFormItemShow } from './utils';

const StringArrayComp: React.SFC<FieldProps> = props => {
  const _log = debug.extend('Field:StringArrayComp');
  const { name, size, ...restFormItemProps } = props;

  const { parentConfig } = getFormItemShow(name);

  const formControl = (fields, { add, remove }) => {
    return (
      <Form.Item {...restFormItemProps}>
        {fields.map((field, index) => (
          <Form.Item key={field.key} required={false} style={{ marginBottom: 8 }}>
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
              <Input
                size={size}
                autoComplete="off"
                defaultValue=""
                style={{ width: 320, marginRight: 8 }}
              />
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
            <Plus /> {formatMessage({ id: 'org.umi.ui.configuration.add.column' })}
          </Button>
        </Form.Item>
      </Form.Item>
    );
  };

  return parentConfig ? (
    <Form.Item shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]} noStyle>
      {({ getFieldValue }) => {
        _log(
          'children field update',
          name,
          parentConfig,
          getFieldValue(name),
          getFieldValue(parentConfig),
        );
        _log('getFieldValue(parentConfig', getFieldValue(parentConfig));
        const parentValue = getFieldValue(parentConfig);
        const isShow = typeof parentValue === 'undefined' || !!parentValue;
        return isShow && <Form.List name={name}>{formControl}</Form.List>;
      }}
    </Form.Item>
  ) : (
    <Form.List name={name}>{formControl}</Form.List>
  );
};

export default StringArrayComp;
