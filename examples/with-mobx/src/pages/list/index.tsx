import React from 'react';
import type { FC } from 'react';
import { history } from 'umi';
import { observer, inject } from 'mobx-react';
import { Location, LocationState } from 'history';
import GloablModel from '@/stores/global';
import styles from './index.css';

interface AppProps<S = LocationState, T = {}> {
  global: GloablModel;
  location: Location<S> & { query: T };
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

export default inject('global')(observer(App));
