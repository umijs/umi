import React from 'react';
import { Form, Select } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const { Option } = Select;

const ListComp: React.SFC<ICompProps> = props => {
  const { name, description, form, choices } = props;
  const { parentConfig } = getFormItemShow(name, form);
  const basicItem = {
    name,
    label: <Label name={name} description={description} />,
  };

  const formControl = (
    <Select style={{ maxWidth: 320 }}>
      {Array.isArray(choices) && choices.map(choice => <Option value={choice}>{choice}</Option>)}
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

export default ListComp;
