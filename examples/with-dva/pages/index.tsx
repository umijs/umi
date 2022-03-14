import React from 'react';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import { connect } from 'umi';

function mapStateToProps(state: any) {
  return {
    count: state.count,
    loading: state.loading,
  };
}

export default connect(mapStateToProps)(function Page(props: any) {
  return (
    <div>
      <h1 className={styles.title}>Count {props.count.num}</h1>
      <div>
        <button
          onClick={() => {
            props.dispatch({
              type: 'count/add',
            });
          }}
        >
          Add
        </button>
        <button
          onClick={() => {
            props.dispatch({
              type: 'count/addAsync',
            });
          }}
        >
          Add Async
        </button>
      </div>
      <div>{props.loading.global ? 'loading... ' : ''}</div>
    </div>
  );
});
