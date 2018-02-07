import router from 'umi/router';
import { connect } from 'react-redux';
import { Component } from '../components/base';
import { List, WhiteSpace, Stepper } from 'antd-mobile';
import Link from 'umi/link';

import { updateValue } from '../redux/action';

const Item = List.Item;

@connect(state => ({
  value: state.global.value,
}))
export default class IndexPage extends Component {
  gotoExtInfoPage = () => {
    router.push({
      pathname: '/extinfo',
      query: { id: 123 },
    });
  };

  onChange = value => {
    this.props.dispatch(updateValue(value));
  };

  render() {
    const { value } = this.props;

    return (
      <div>
        <List>
          <Link
            to={{
              pathname: '/extinfo',
              search: '?test=123',
            }}
          >
            <Item>链接跳转</Item>
          </Link>
          <Item
            extra="扩展信息"
            arrow="horizontal"
            onClick={this.gotoExtInfoPage}
          >
            路由跳转
          </Item>
        </List>
        <WhiteSpace />
        <List.Item
          wrap
          extra={
            <Stepper
              style={{ width: '100%', minWidth: '100px' }}
              showNumber
              max={10}
              min={1}
              value={value}
              onChange={this.onChange}
            />
          }
        >
          数值
        </List.Item>
      </div>
    );
  }
}
