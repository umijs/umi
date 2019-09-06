import * as React from 'react';
import { Export } from '@ant-design/icons';
import { message, Form } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Label from './label';
import Context from '@/layouts/Context';
import { callRemote } from '@/socket';
import { ICompProps } from './index';
import styles from './styles.module.less';

const AnyComp: React.SFC<ICompProps> = props => {
  const _log = g_uiDebug.extend('Field:AnyComp');
  const { name, ...restFormItemProps } = props;
  const { currentProject } = React.useContext(Context);
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
  return (
    <Form.Item {...basicItem}>
      <div className={styles['any-field']}>
        <Export />
        <a onClick={handleClick}>
          {formatMessage({ id: 'org.umi.ui.configuration.edit.in.editor' })}
        </a>
      </div>
    </Form.Item>
  );
};

export default AnyComp;
