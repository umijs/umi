import React from 'react';
import { Form, Input } from 'antd';
import { FieldProps } from './index';
import debug from '@/debug';
import { getFormItemShow } from './utils';

const { TextArea } = Input;

const TextAreaComp: React.SFC<FieldProps> = props => {
  const _log = debug.extend('Field:TextAreaComp');
  const { name, form, ...restFormItemProps } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    required: false,
    rules: [{ required: !!form.getFieldValue(name), message: '请输入' }],
    ...restFormItemProps,
  };

  const formControl = <TextArea autoComplete="off" rows={4} style={{ maxWidth: 320 }} />;

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
        const parentValue = getFieldValue(parentConfig);
        const isShow = typeof parentValue === 'undefined' || !!parentValue;
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

export default TextAreaComp;
