import React from 'react';
import styles from './Bar.less';

const Bar = props => {
  return (
    <h2 className={styles.title}>{props.title}</h2>
  );
};

Bar.getInitialProps = () => {
  return {
    title: 'Bar',
  };
};

export default Bar;
