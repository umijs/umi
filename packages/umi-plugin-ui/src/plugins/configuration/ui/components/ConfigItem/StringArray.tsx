import React from 'react';
import { Form, Input, Button } from 'antd';
import { MinusCircle, Plus } from '@ant-design/icons';
import Context from '../../Context';
import { ICompProps } from './index';
import Label from './label';
import { getFormItemShow } from './utils';

const { useContext } = React;

const StringArrayComp: React.SFC<ICompProps> = props => {
  const { name, description, title, link } = props;
  const { debug: _log } = useContext(Context);
  const { parentConfig } = getFormItemShow(name);
  const label = <Label name={name} title={title} description={description} link={link} />;

  const formControl = (fields, { add, remove }) => {
    return (
      <Form.Item label={label}>
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
              <Input autoComplete="off" defaultValue="" style={{ width: 320, marginRight: 8 }} />
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
        _log(
          'children field update',
          name,
          parentConfig,
          getFieldValue(name),
          getFieldValue(parentConfig),
        );
        _log('getFieldValue(parentConfig', getFieldValue(parentConfig));
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
