import * as React from 'react';
import { ExportOutlined } from '@ant-design/icons';
import { message, Form } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import Context from '@/layouts/Context';
import debug from '@/debug';
import { openConfigFile } from '@/services/project';
import { getFormItemShow } from './utils';
import { FieldProps } from './index';
import styles from './styles.module.less';

const AnyComp: React.SFC<FieldProps> = props => {
  const _log = debug.extend('Field:AnyComp');
  const { name, ...restFormItemProps } = props;
  const { currentProject } = React.useContext(Context);
  const { parentConfig } = getFormItemShow(name);

  const basicItem = {
    name,
    valuePropName: 'checked',
    ...restFormItemProps,
  };

  const handleClick = async () => {
    try {
      await openConfigFile({
        projectPath: currentProject ? currentProject.path : '',
      });
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
      <ExportOutlined />
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
