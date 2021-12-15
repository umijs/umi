import React from 'react';
import { connect } from 'react-redux';

function mapStateToProps(state: any) {
  return {
    count: state.count,
  };
}

export default connect(mapStateToProps)((props: any) => {
  return (
    <div>
      <h1>dva</h1>
      <p>count: {props.count}</p>
      <button onClick={() => props.dispatch({ type: 'count/add' })}>+</button>
    </div>
  );
});
