import * as React from 'react';
import { Export } from '@ant-design/icons';
import { message, Form } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Context from '@/layouts/Context';
import { callRemote } from '@/socket';
import { getFormItemShow } from './utils';
import { FieldProps } from './index';
import styles from './styles.module.less';

const AnyComp: React.SFC<FieldProps> = props => {
  const _log = g_uiDebug.extend('Field:AnyComp');
  const { name, ...restFormItemProps } = props;
  const { currentProject } = React.useContext(Context);
  const { parentConfig } = getFormItemShow(name);
  const openConfigAction = {
    title: 'org.umi.ui.configuration.actions.open.config',
    type: 'default',
    action: {
      type: '@@actions/openConfigFile',
      payload: {
        projectPath: currentProject ? currentProject.path : '',
      },
    },
  };
  const { action } = openConfigAction;
  const basicItem = {
    name,
    valuePropName: 'checked',
    ...restFormItemProps,
  };

  const handleClick = async () => {
    try {
      await callRemote(action);
    } catch (e) {
      message.error(
        e && e.message
          ? e.message
          : formatMessage({ id: 'org.umi.ui.configuration.open.editor.failure' }),
      );
      _log('AnyComp error', e);
    }
  };

  const formControl = (
    <div className={styles['any-field']}>
      <Export />
      <a onClick={handleClick}>
        {formatMessage({ id: 'org.umi.ui.configuration.edit.in.editor' })}
      </a>
    </div>
  );

  return parentConfig ? (
    <Form.Item noStyle shouldUpdate={(prev, curr) => prev[parentConfig] !== curr[parentConfig]}>
      {({ getFieldValue }) => {
        _log(
          'AnyComp children field update',
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

export default AnyComp;
