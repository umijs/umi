import React from 'react';
// @ts-ignore
import styles from './SectionHeader.css';

export default (props: { title: string }) => {
  return (
    <div className={styles.normal}>
      <div></div>
      <h2>{props.title}</h2>
      <div></div>
    </div>
  );
};
