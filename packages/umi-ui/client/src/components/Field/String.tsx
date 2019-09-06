import React from 'react';
import { Form, Input } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { FieldProps } from './index';
import { getFormItemShow } from './utils';

const StringComp: React.SFC<FieldProps> = props => {
  const _log = g_uiDebug.extend('Field:StringComp');
  const { name, defaultValue, ...restFormItemProps } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    required: false,
    rules: [
      {
        // 没有 defaultValue 非必填
        required: !!defaultValue,
        message: formatMessage({ id: 'org.umi.ui.configuration.string.required' }),
      },
    ],
    ...restFormItemProps,
  };

  const formControl = <Input autoComplete="off" style={{ maxWidth: 320 }} />;

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

export default StringComp;
