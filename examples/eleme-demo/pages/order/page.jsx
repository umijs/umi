import * as React from "react";
import router from "umi/router";
import { NavBar, Icon, Button } from "antd-mobile";
import * as styles from "./page.less";

export default class extends React.Component {

  renderItem = (data) => {
    return (
      <div>{data.title}</div>
    )
  }

  render() {
    const items = [
      { title: '金币商城' },
      { title: '有红包快抢' },
      { title: '必吃爆料' },
      { title: '推荐有奖' },
      { title: '周边优惠' },
      { title: '百元红包' },
    ];

    return (
      <div>
        <NavBar
          onLeftClick={() => router.goBack()}
          mode="dark"
          icon={<Icon type="left" />}
        >订单</NavBar>
        <div className={styles.noLogin}>
          <img src="//fuss10.elemecdn.com/d/60/70008646170d1f654e926a2aaa3afpng.png" alt="" />
          <h3>登录后查看外卖订单</h3>
          <Button>立即登录</Button>
        </div>
      </div>
    )
  }
}
