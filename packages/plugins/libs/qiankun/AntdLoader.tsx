// @ts-nocheck
/* eslint-disable */
import { Spin } from 'antd';
import React from 'react';

export default function AntdLoader(props: { loading: boolean }) {
  const { loading } = props;
  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
  return <Spin spinning={loading} size="large" style={style} />;
}
