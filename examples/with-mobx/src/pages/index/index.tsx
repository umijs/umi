import React from 'react';
import type { FC } from 'react';
import { Link } from 'umi';
import { Location, LocationState } from 'history';
import { observer, inject } from 'mobx-react';
import GloablModel from '@/stores/global';
import Count from './components/Count';
import styles from './index.css';

interface AppProps<S = LocationState, T = {}> {
  location: Location<S> & { query: T };
  global: GloablModel;
}

const App: FC<AppProps> = ({ location, global }) => {
  const { pathname } = location;
  return (
    <div className={styles.normal}>
      <h2>
        {global.text} @ {pathname}
      </h2>
      <Count />
      <br />
      <button
        onClick={() => {
          global.setText('setted mobx');
        }}
      >
        Set Title
      </button>
      <br />
      <div>
        <Link to="/list">Go to /list</Link>
      </div>
      <div>
        <Link to="/list/list">Go to /list/list</Link>
      </div>
      <div>
        <Link to="/list/search">Go to /list/search</Link>
      </div>
      <div>
        <Link to="/admin">Go to /admin</Link>
      </div>
      <div>
        <Link to="/delay">Go to /delay</Link>
      </div>
    </div>
  );
};

export default inject('global')(observer(App));
