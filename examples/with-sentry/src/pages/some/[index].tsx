import { Button } from 'antd-mobile';
import React, { FC, useEffect, useState } from 'react';
import { connect, ConnectProps, IndexModelState } from 'umi';
import styles from './index.less';

interface PageProps extends ConnectProps {
  index: IndexModelState;
}

const IndexPage: FC<PageProps> = ({ index, dispatch }) => {
  const [state, setstate] = useState(0);
  useEffect(() => {
    dispatch?.({
      type: 'index/query',
    });
  }, []);
  const { name } = index;
  return (
    <div
      className={styles.center}
      onClick={() => {
        // 这里故意设置了一个错误，会触发运行时配置
        // @ts-ignore
        setstate({ a: 123 });
        console.log('click');
      }}
    >
      Hello {name}
      {state}
      <Button type="warning">点击触发一个错误,并弹出用户反馈</Button>
    </div>
  );
};

export default connect(({ index }: { index: IndexModelState }) => ({ index }))(
  IndexPage,
);
