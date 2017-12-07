import React from 'react';
import router from 'umi/router';
import styles from './page.css';

export default () => (
  <div className={styles.normal}>
    <h2>List Page</h2>
    <div
      onClick={() => {
        router.goBack();
      }}
    >
      Back
    </div>
  </div>
);
