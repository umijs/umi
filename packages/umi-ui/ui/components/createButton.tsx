import React from 'react';
import { Button } from 'antd';
import { IUiApi } from 'umi-types';

export default props => {
  const { api } = props;
  const handleClick = async () => {
    const res = await api.callRemote({
      type: 'org.baseUI.bigfish.aaa',
    });
    console.log('res', res);
  };
  return <Button onClick={handleClick}>Hello</Button>;
};
