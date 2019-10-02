import { connect } from 'dva';

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

App.getInitialProps = async ({ store, route, isServer }) => {
  console.log('Count getInitialProps', store, route, isServer);
  await store.dispatch({
    type: 'count/reset',
  });
  await store.dispatch({
    type: 'count/init',
  });
};

export default connect(state => {
  return { count: state.count };
})(App);
