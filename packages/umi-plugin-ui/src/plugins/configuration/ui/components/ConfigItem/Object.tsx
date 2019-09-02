import React from 'react';
import { Form } from 'antd';
import { ICompProps } from './index';
import Label from './label';
import Context from '../../Context';
import ObjectField from './fields/ObjectField';
import { getFormItemShow } from './utils';

const COMMON_BROWSER = ['chrome', 'safari', 'firefox'];

const { useContext } = React;

const ObjectComp: React.SFC<ICompProps> = props => {
  const { name, description, title, choices, default: defaultValue, link } = props;
  const { debug: _log, api } = useContext(Context);
  const { _, intl } = api;
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} link={link} />,
    rules: [
      {
        validateTrigger: 'onSubmit',
        validator: async (rule, value) => {
          // should be object-number
          const isObject = _.isPlainObject(value);
          if (!isObject) {
            throw new Error(intl({ id: 'org.umi.ui.configuration.basic.config.object.error' }));
          }
          if (Object.keys(value).some(v => v === 'undefined')) {
            // { 'undefined':  }
            throw new Error(
              intl({ id: 'org.umi.ui.configuration.basic.config.object.select.error' }),
            );
          }
        },
      },
    ],
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
