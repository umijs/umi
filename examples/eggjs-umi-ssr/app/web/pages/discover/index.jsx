import * as React from 'react';
import router from 'umi/router';
import { NavBar, Icon, Grid } from 'antd-mobile';
import styles from './index.module.less';

export default class extends React.Component {
  renderItem = data => {
    return <div>{data.title}</div>;
  };

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
        <NavBar onLeftClick={() => router.goBack()} mode="dark" icon={<Icon type="left" />}>
          发现
        </NavBar>
        <Grid data={items} columnNum={2} square={false} renderItem={this.renderItem} />
        <div className={styles.recommend}>为你推荐</div>
      </div>
    );
  }
}
