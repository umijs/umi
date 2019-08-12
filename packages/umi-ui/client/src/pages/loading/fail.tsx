import React, { Fragment } from 'react';
import { Card } from 'antd';
import Result, { IResultProps } from '@/components/Result';

const Fail: React.SFC<IResultProps> = props => (
  <Card bordered={false}>
    <Result type="error" style={{ marginTop: 48, marginBottom: 16 }} {...props} />
  </Card>
);

export default Fail;
