import React from 'react';
import { Form, Select } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const { Option } = Select;

const ListComp: React.SFC<ICompProps> = props => {
  const { name, description, form, title, choices } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} />,
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

export default ListComp;
