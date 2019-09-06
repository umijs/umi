import React from 'react';
import { Form, Input } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const StringComp: React.SFC<ICompProps> = props => {
  const _log = g_uiDebug.extend('Field:StringComp');
  const { name, description, title, default: defaultValue, link } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    required: false,
    label: <Label name={name} title={title} description={description} link={link} />,
    rules: [{ required: !!defaultValue, message: `请输入${title}` }],
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
