import React from 'react';
import './global.less';
// @ts-ignore
import styles from './index.less';

// @ts-ignore
// const styles = await import('./index.less');

export default function HomePage() {
  return <div className={styles.title}>HomePage</div>;
}
