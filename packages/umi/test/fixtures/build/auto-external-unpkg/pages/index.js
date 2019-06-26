import React, { PureComponent } from 'react';
import { Card } from 'antd';

class CardList extends PureComponent {
  render() {
    return (<Card title="卡片标题">卡片内容</Card>);
  }
}

export default CardList;
