import { connect } from 'dva';
import { Button } from 'antd-mobile';

function Count({ dispatch, count }) {
  return (
    <div>
      <div>Count: {count}</div>
      <br />
      <div>
        <Button
          type="primary"
          onClick={() => {
            dispatch({ type: 'count/increase' });
          }}
        >
          Increase
        </Button>
        <Button
          type="ghost"
          onClick={() => {
            dispatch({ type: 'count/decrease' });
          }}
        >
          Decrease
        </Button>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    count: state.count,
  };
}

export default connect(mapStateToProps)(Count);
