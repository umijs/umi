import React from 'react';
import styles from './index.css';

export default function(props) {
  return (
    <button
      className={`${styles.g}`}
      style={{
        fontSize: props.size === 'large' ? 40 : 20,
      }}
    >
      { props.children }
    </button>
  );
}
