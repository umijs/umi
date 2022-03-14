import React from 'react';
// @ts-ignore
import styles from './index.less';
// @ts-ignore
import { connect } from 'umi';

function mapStateToProps(state: any) {
  return {
    count: state.count,
  };
}

export default connect(mapStateToProps)(function Page(props: any) {
  return (
    <div>
      <h1 className={styles.title}>Count {props.count}</h1>
      <button
        onClick={() => {
          props.dispatch({
            type: 'count/add',
          });
        }}
      >
        Add
      </button>
    </div>
  );
});
