import React from 'react';
import Link from 'umi/link';
import Count from './components/Count';
import A from 'components/A';
import styles from './page.css';

export default () => {
  return (
    <div className={styles.normal}>
      <h2>Index Page</h2>
      <A />
      <Count />
      <br />
      <div>
        <Link to="/list">Go to list.html</Link>
      </div>
    </div>
  );
};
