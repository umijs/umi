/**
 * title: Count
 */
import { connect } from 'dva';
import styles from './count.css';

function Page(props) {
  return (
    <div className={styles.normal}>
      <h1>Page count</h1>
      <h2>count {props.count}</h2>
      <button onClick={() => {
        props.dispatch({
          type: 'count/add',
        });
      }}>Add</button>
    </div>
  );
}

Page.getInitialProps = async () => {
  console.log('Count getInitialProps');
  await require('@tmp/dva').getApp()._store.dispatch({
    type: 'count/init',
  });
};

export default connect(state => {
  return {
    count: state.count,
  }
})(Page);
