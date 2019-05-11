import { connect } from 'umi';

function App(props) {
  return (
    <div>
      <h1>count: {props.count}</h1>
      <button onClick={() => {
        props.dispatch({ type: 'count/add' });
      }}>add</button>
    </div>
  );
}

export default connect(state => {
  return { count: state.count };
})(App);
