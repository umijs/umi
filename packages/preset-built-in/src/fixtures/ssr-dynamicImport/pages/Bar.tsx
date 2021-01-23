import React from 'react';
import styles from './Bar.less';

const Bar = props => {
  console.log('This is Bar component', props);
  return (
    <h2 className={styles.title}>{props.title}</h2>
  );
};

Bar.getInitialProps = async () => {
  return {
    title: 'Bar',
  };
};

export default Bar;
