import React from 'react';
import { Form } from 'antd';
import isPlainObject from 'lodash/isPlainObject';
import { formatMessage } from 'umi-plugin-react/locale';
import { FieldProps } from './index';
import ObjectField from './fields/ObjectField';
import { getFormItemShow } from './utils';

const COMMON_BROWSER = ['chrome', 'safari', 'firefox'];

/**
 * TDDO: 使用 Form.List ，需要增加 api， format , 将 object => object[]
 *       保存的时候再将 object[] => object
 */
const ObjectComp: React.FC<FieldProps> = props => {
  const _log = g_uiDebug.extend('Field:ObjectComp');
  const { name, choices, defaultValue, ...restFormItemProps } = props;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    rules: [
      {
        validateTrigger: 'onSubmit',
        validator: async (rule, value) => {
          // should be object-number
          const isObject = isPlainObject(value);
          if (!isObject) {
            throw new Error(
              formatMessage({ id: 'org.umi.ui.configuration.basic.config.object.error' }),
            );
          }
          const isUndefined = Object.keys(value).some(v => v === 'undefined');
          if (isUndefined) {
            // { 'undefined':  }
            throw new Error(
              formatMessage({ id: 'org.umi.ui.configuration.basic.config.object.select.error' }),
            );
          }
        },
      },
    ],
    ...restFormItemProps,
  };
  _log('choices', choices);

  const getIcon = vv =>
    name === 'targets' ? (COMMON_BROWSER.includes(vv) ? vv : 'default') : null;

  const options = choices
    ? choices.map(choice => ({ name: choice, value: choice, icon: getIcon(choice) }))
    : Object.keys(defaultValue).map(v => ({ name: v, value: v, icon: getIcon(v) }));

  const formControl = <ObjectField options={options} defaultValue={defaultValue} />;

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

export default ObjectComp;
