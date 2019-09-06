import * as React from 'react';
import { Export } from '@ant-design/icons';
import { message, Form } from 'antd';
import Label from './label';
import { ICompProps } from './index';
import Context from '../../Context';
import styles from './styles.module.less';

const AnyComp: React.SFC<ICompProps> = props => {
  const { name, description, title, link } = props;
  const { debug: _log, openConfigAction, api } = React.useContext(Context);
  const { action } = openConfigAction;
  const basicItem = {
    name,
    label: <Label title={title} description={description} link={link} />,
    valuePropName: 'checked',
  };

  const handleClick = async () => {
    try {
      await api.callRemote(action);
    } catch (e) {
      message.error(
        e && e.message
          ? e.message
          : api.intl({ id: 'org.umi.ui.configuration.open.editor.failure' }),
      );
      _log('AnyComp error', e);
    }
  };
  return (
    <Form.Item {...basicItem}>
      <div className={styles['any-field']}>
        <Export />
        <a onClick={handleClick}>{api.intl({ id: 'org.umi.ui.configuration.edit.in.editor' })}</a>
      </div>
    </Form.Item>
  );
};

export default AnyComp;
