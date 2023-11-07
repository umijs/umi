// @ts-ignore
import { connect } from '@@/plugin-dva';
import dayjs from 'dayjs';

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
