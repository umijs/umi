// @ts-ignore
import { connect } from '@@/plugin-dva';
// @ts-ignore
import { Button, DatePicker, Input } from 'antd';
import React from 'react';

function mapStateToProps(state: any) {
  return { count: state.count };
}

export default connect(mapStateToProps)(function HomePage(props: any) {
  return (
    <div>
      <h2>antd</h2>
      <Button type="primary">Button</Button>
      <Input />
      <DatePicker />
      <h2>count: {props.count}</h2>
    </div>
  );
});
