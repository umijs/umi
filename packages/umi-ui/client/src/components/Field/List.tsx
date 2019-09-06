import React from 'react';
import { Form, Select } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const { Option } = Select;

const ListComp: React.SFC<ICompProps> = props => {
  const _log = g_uiDebug.extend('Field:ListComp');
  const { name, description, form, title, choices, link } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} link={link} />,
  };

  const formControl = (
    <Select style={{ maxWidth: 320 }} getPopupContainer={triggerNode => triggerNode.parentNode}>
      {Array.isArray(choices) &&
        choices.map(choice => (
          <Option key={choice} value={choice}>
            {choice}
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
