import React from 'react';
import type { FC } from 'react';
import { history, ConnectProps, connect, GlobalModelState } from 'umi';
import styles from './index.css';

interface AppProps extends ConnectProps {
  global: GlobalModelState;
}

const App: FC<AppProps> = ({ location, global }) => {
  const { pathname } = location;

  return (
    <div className={styles.normal}>
      <h2>
        {global.text} @ {pathname}
      </h2>
      <button
        onClick={() => {
          history.goBack();
        }}
      >
        back
      </button>
    </div>
  );
};

export default connect(({ global }: { global: GlobalModelState }) => ({
  global,
}))(App);
