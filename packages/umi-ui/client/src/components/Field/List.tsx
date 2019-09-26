import React from 'react';
import { Form, Select } from 'antd';
import { FieldProps } from './index';
import debug from '@/debug';
import { getFormItemShow } from './utils';

const { Option } = Select;

const ListComp: React.SFC<FieldProps> = props => {
  const _log = debug.extend('Field:ListComp');
  const { name, form, options, ...restFormItemProps } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    ...restFormItemProps,
  };

  const formControl = (
    <Select style={{ maxWidth: 320 }} getPopupContainer={triggerNode => triggerNode.parentNode}>
      {Array.isArray(options) &&
        options.map(opt => (
          <Option key={opt} value={opt}>
            {opt}
          </Option>
        ))}
    </Select>
  );

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

export default ListComp;
