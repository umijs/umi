import React from 'react';
import { Card, Result } from 'antd';
import cls from 'classnames';
import { ResultProps } from 'antd/lib/result';
import { InfoCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import styles from './index.less';

interface IFailProps extends ResultProps {
  loading?: boolean;
}

const Fail: React.SFC<Partial<IFailProps>> = props => {
  const { icon, loading, ...restProps } = props;
  const resultCls = cls(styles.result, {
    [styles['result-loading']]: !!loading,
  });
  return (
    <div className={resultCls}>
      <Result
        icon={loading ? <LoadingOutlined /> : <InfoCircleOutlined />}
        style={{ marginTop: 0, marginBottom: 16 }}
        {...restProps}
      />
    </div>
  );
};

export default Fail;
