import React from 'react';
import styles from './Bar.less';

const Bar = props => {
  console.log('-----getInitialProps step-2---')
  return (
    <h2 className={styles.title}>{props.title}</h2>
  );
};

Bar.getInitialProps = async () => {
  console.log('-----getInitialProps step-1---')
  return {
    title: 'Bar',
  };
};

export default Bar;
