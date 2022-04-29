// @ts-ignore
import { connect } from '@@/plugin-dva';
// @ts-ignore
import dayjs from 'moment';
import React from 'react';

function mapStateToProps(state: any) {
  return { count: state.count };
}

export default connect(mapStateToProps)(function HomePage(props: any) {
  return (
    <div>
      <h2>dva</h2>
      <p>dayjs: {dayjs().format()}</p>
      <p>count: {props.count}</p>
      <button onClick={() => props.dispatch({ type: 'count/add' })}>+</button>
    </div>
  );
});
