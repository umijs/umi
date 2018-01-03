import React from 'react';
import Link from 'umi/link';
import dva from 'dva';
import Count from './components/Count';
import styles from './page.css';

import { default as event, Events, EventTypes } from 'umi/event';
const { PAGE_INITIALIZED } = Events;

event.addEventListener<EventTypes.PAGE_INITIALIZED_TYPE>(PAGE_INITIALIZED, (evt) => {
  console.log('PAGE_INITIALIZED', evt);
});

const app = dva();
app.model(require('./models/count').default);

app.router(() => {
  return (
    <div className={styles.normal}>
      <h2>Index Page</h2>
      <Count />
      <br />
      <div>
        <Link to="/list">Go to list.html</Link>
      </div>
    </div>
  );
});

export default app.start();
