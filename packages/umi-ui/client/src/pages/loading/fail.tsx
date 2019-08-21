import React, { Fragment } from 'react';
import { Card, Result } from 'antd';
import { ResultProps } from 'antd/lib/result';
import { InfoCircle } from '@ant-design/icons';
import styles from './index.less';

const Fail: React.SFC<ResultProps> = props => (
  <Card bordered={false} className={styles.result}>
    <Result icon={<InfoCircle />} style={{ marginTop: 48, marginBottom: 16 }} {...props} />
  </Card>
);

export default Fail;
