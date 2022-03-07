// @ts-ignore
import marked from 'marked';
import React from 'react';
// @ts-ignore
import Smileurl, { ReactComponent as SvgSmile } from '../smile.svg';
import './global.less';
// @ts-ignore
import styles from './index.less';

export default function HomePage() {
  console.log('marked', marked);
  const [count] = React.useState(0);

  return (
    <div className={styles.title}>
      HomePage
      <div>count: {count}</div>
      <div className={styles.smile}></div>
      <img src={Smileurl} alt="" />
      <SvgSmile />
    </div>
  );
}
