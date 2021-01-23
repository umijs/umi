import React from 'react';
import styles from './Bar.less';

const Bar = props => {
  return (
    <h2 className={styles.title}>{props.title}</h2>
  );
};

Bar.getInitialProps = () => {
  return Promise.resolve({
    title: 'Bar',
  });
};

export default Bar;
