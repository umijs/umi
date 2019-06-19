import React, { Component } from 'react';
import router from 'umi/router';
import { NavBar, Icon, Tabs, List, Button, WhiteSpace } from 'antd-mobile';
import styles from './index.module.less';

export default class extends Component {
  state = {
    index: 0,
    menuIndex: 0,
    menu: [],
    info: {},
  };

  componentDidMount() {
    window.scrollTo(0, 0);
    const id = this.props.location.query.id;
    this.loadMenu(id);
    this.loadInfo(id);
  }

  getImage = hash => {
    if (!hash) {
      return '';
    }
    const path = hash[0] + '/' + hash.substr(1, 2) + '/' + hash.substr(3);
    let type = 'jpeg';
    if (path.indexOf('png') > -1) {
      type = 'png';
    }
    return `http://fuss10.elemecdn.com/${path}.${type}`;
  };

  itemOffset = {};

  loadMenu = id => {
    fetch(`/restapi/shopping/v2/menu?restaurant_id=${id}`)
      .then(res => {
        if (res.status === 200) {
          res.json().then(data => {
            this.setState({
              menu: data,
            });
          });
        }
      })
      .catch(err => {
        console.warn(err);
      });
  };

  loadInfo = id => {
    const { longitude, latitude } = this.props.location.query;
    fetch(
      `/restapi/shopping/restaurant/${id}?extras[]=activities&extras[]=albums&extras[]=license&extras[]=identification&extras[]=qualification&terminal=h5&latitude=${latitude}&longitude=${longitude}`,
    )
      .then(res => {
        if (res.status === 200) {
          res.json().then(data => {
            this.setState({
              info: data,
            });
          });
        }
      })
      .catch(err => {
        console.warn(err);
      });
  };

  throttle = false;
  offset = 0;

  renderTab = tab => {
    return <div className={styles.menuItem}>{tab.name}</div>;
  };

  renderFood = (item, index) => {
    const id = item.id || item.virtual_food_id;
    if (item._type === 'type') {
      return (
        <div
          key={id + `_${index}`}
          id={id}
          ref={dom => {
            if (!dom) return;
            this.itemOffset[id] = { top: dom.offsetTop, id };
          }}
        >
          <List.Item>
            <div className={styles.foodType}>
              {item.name} <span className={styles.desc}>{item.description}</span>
            </div>
          </List.Item>
        </div>
      );
    }
    if (item._type === 'food') {
      return (
        <div key={id + `_${index}`} id={id}>
          <List.Item>
            <div className={styles.food}>
              <div className={styles.image}>
                <img src={this.getImage(item.image_path)} alt={item.name} />
              </div>
              <div className={styles.info}>
                <div>{item.name}</div>
                <div className={styles.subInfo}>
                  月售{item.month_sales}份 好评率{item.satisfy_rate}%
                </div>
              </div>
            </div>
          </List.Item>
        </div>
      );
    }
  };

  render() {
    const { index, info, menu, menuIndex } = this.state;
    const item = [];
    menu.forEach(m => {
      item.push({
        _type: 'type',
        ...m,
        foods: null,
      });
      (m.foods || []).forEach(food => {
        item.push({
          _type: 'food',
          ...food,
        });
      });
    });

    return (
      <div className={styles.discover}>
        <NavBar onLeftClick={() => router.goBack()} mode="dark" icon={<Icon type="left" />} />
        <div className={styles.info}>
          <div className={styles.logo}>
            <img src={this.getImage(info.image_path)} alt={info.name} />
          </div>
          <div className={styles.title}>
            {info.is_premium ? <span className={styles.premium}>品牌</span> : null}
            {info.name}
          </div>
        </div>
        <Tabs
          tabs={[{ title: '点餐' }, { title: '评价' }, { title: '商家' }]}
          useOnPan={false}
          swipeable={false}
          page={index}
          onChange={(tab, index) => {
            this.setState({ index });
          }}
        >
          <div className={styles.menu}>
            <div>
              <Tabs
                tabs={menu}
                tabBarPosition="left"
                tabDirection="vertical"
                usePaged={false}
                swipeable={false}
                page={menuIndex}
                onChange={(tab, index) => {
                  this.setState(
                    {
                      menuIndex: index,
                    },
                    () => {
                      document
                        .getElementById('foodList')
                        .scrollTo(0, document.getElementById(tab.id).offsetTop);
                    },
                  );
                }}
                renderTabBar={props => (
                  <Tabs.DefaultTabBar {...props} renderTab={this.renderTab} page={10} />
                )}
              />
            </div>
            <div
              id="foodList"
              className={styles.list}
              onScroll={evt => {
                this.offset = evt.nativeEvent.target.scrollTop + 200;
                if (this.throttle) return;
                this.throttle = true;

                setTimeout(() => {
                  this.throttle = false;
                  const items = Object.keys(this.itemOffset)
                    .map(key => this.itemOffset[key])
                    .sort((a, b) => a.top - b.top);
                  const index = items.findIndex(i => i.top > this.offset);
                  this.setState({
                    menuIndex: index - 1,
                  });
                }, 300);
              }}
            >
              <List>{item.map((food, index) => this.renderFood(food, index))}</List>
            </div>
          </div>
          <div className={styles.overview}>
            <List>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
              <List.Item>评价</List.Item>
            </List>
          </div>
          <div className={styles.overview}>
            <List>
              <List.Item multipleLine>
                <div>商家信息</div>
                <div className={styles.subInfo}>{info.name}</div>
              </List.Item>
              <List.Item extra={(info.flavors || []).map(f => f.name).join('、')}>品类</List.Item>
              <List.Item extra={info.phone}>商家电话</List.Item>
              <List.Item extra={info.address}>地址</List.Item>
              <List.Item extra={(info.opening_hours || []).join('、')}>营业时间</List.Item>
            </List>
            <WhiteSpace />
            <List>
              <List.Item arrow="horizontal">营业资质</List.Item>
            </List>
          </div>
        </Tabs>
        {index === 0 && (
          <div className={styles.footer}>
            <Button>¥20起送</Button>
          </div>
        )}
      </div>
    );
  }
}
