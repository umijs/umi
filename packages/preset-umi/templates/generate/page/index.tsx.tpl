import React from 'react';
import styles from './index{{{ cssExt }}}';

export default function Page() {
  return (
    <div>
      <h1 className={styles.title}>Page {{{ name }}}</h1>
    </div>
  );
}
