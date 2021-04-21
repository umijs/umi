import React from 'react';
import styles from './Bar.less';

const Bar: React.FC<{ title: any[] }> & {
  getInitialProps: (props: any) => any;
} = (props) => {
  return <h2 className={styles.title}>{props.title}</h2>;
};

Bar.getInitialProps = () => {
  return {
    title: 'Bar',
  };
};

export default Bar;
