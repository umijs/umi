import * as React from 'react';
import router from 'umi/router';
import { NavBar, Icon, Button } from 'antd-mobile';
import styles from './index.module.less';

export default class extends React.Component {
  renderItem = data => {
    return <div>{data.title}</div>;
  };

  render() {
    return (
      <div>
        <NavBar onLeftClick={() => router.goBack()} mode="dark" icon={<Icon type="left" />}>
          订单
        </NavBar>
        <div className={styles.noLogin}>
          <img src="//fuss10.elemecdn.com/d/60/70008646170d1f654e926a2aaa3afpng.png" alt="" />
          <h3>登录后查看外卖订单</h3>
          <Button>立即登录</Button>
        </div>
      </div>
    );
  }
}
