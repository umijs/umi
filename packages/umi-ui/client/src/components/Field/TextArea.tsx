import React from 'react';
import { Form, Input } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const { TextArea } = Input;

const TextAreaComp: React.SFC<ICompProps> = props => {
  const _log = g_uiDebug.extend('Field:TextAreaComp');
  const { name, defaultValue, ...restFormItemProps } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    required: false,
    rules: [{ required: !!defaultValue, message: '请输入' }],
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
