import React from 'react';
// @ts-ignore
import { connect, getDvaApp } from 'umi';
import Foo from '../Foo';
// @ts-ignore
import styles from './index.less';

function mapStateToProps(state: any) {
  return {
    count: state.count,
    bar: state['foo.bar.model'],
    loading: state.loading,
  };
}

export default connect(mapStateToProps)(function Page(props: any) {
  return (
    <div>
      <Foo name="hahaha" />
      <h1 className={styles.title}>Count {props.count.num}</h1>
      <h1 className={styles.title}>Count {props.bar.num}</h1>
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
        <button
          onClick={() => {
            props.dispatch({
              type: 'count/throwError',
            });
          }}
        >
          Throw Effect Error
        </button>
        <button
          onClick={() => {
            alert(`count: ${getDvaApp()._store.getState().count.num}`);
          }}
        >
          test getDvaApp
        </button>
      </div>
      <div>{props.loading.global ? 'loading... ' : ''}</div>
    </div>
  );
});
