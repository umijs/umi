import * as React from 'react';
import { Form, Switch } from 'antd';
import { IUi } from 'umi-types';
import Label from './label';
import { getFormItemShow } from './utils';

const BooleanComp: React.SFC<IUi.IFieldProps> = props => {
  const _log = g_uiDebug.extend('Field:BooleanComp');
  const { name, form, value, ...restFormItemProps } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    valuePropName: 'checked',
    ...restFormItemProps,
  };

  React.useEffect(() => {
    // 4.0 form Switch 不设置 initValue 为 undefined
    // 所以 monuted 时给一个 boolean
    form.setFieldsValue({
      [name]: value === true,
    });
  }, []);

  return parentConfig ? (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]}>
      {({ getFieldValue }) => {
        _log(
          'BooleanComp children field update',
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
              <Switch size="small" />
            </Form.Item>
          )
        );
      }}
    </Form.Item>
  ) : (
    <Form.Item {...basicItem}>
      <Switch size="small" />
    </Form.Item>
  );
};

export default BooleanComp;
