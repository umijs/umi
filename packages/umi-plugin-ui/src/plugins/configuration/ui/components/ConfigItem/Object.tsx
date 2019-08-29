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
  const { name, description, title, choices, default: defaultValue } = props;
  const { debug: _log } = useContext(Context);
  const { parentConfig } = getFormItemShow(name);
  const basicItem = {
    name,
    label: <Label name={name} title={title} description={description} />,
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

export default ObjectComp;
