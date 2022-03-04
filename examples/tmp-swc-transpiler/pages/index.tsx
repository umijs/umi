import React from 'react';
import './global.less';
// @ts-ignore
import styles from './index.less';

// @ts-ignore
// const styles = await import('./index.less');

export default function HomePage() {
  // check async transpiler
  const func = async () => {
    // need inject polyfill `Array.flat` on production env
    (window as any).a = [1, 2, 3].flat();
  };

  func();

  return <div className={styles.title}>HomePage</div>;
}
