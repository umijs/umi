import React from 'react';
import './index.css';
import './b.less';
import styles from './index.module.css';
import lStyles from './c.module.less';

export default function(props) {
  return (
    <button
      className={`${styles.button} g b ${lStyles.p}`}
      style={{
        fontSize: props.size === 'large' ? 40 : 20,
      }}
    >
      { props.children }
    </button>
  );
}
