import React from 'react';

const styles = {
  normal: 'normal___1KW4T',
};

function Page(props) {
  return (
    <div className={styles.normal}>
      <h1>Page index</h1>
      <h2>csr: {props.data && props.data.csr}</h2>
    </div>
  );
}

Page.getInitialProps = () => {
  console.log('Home getInitialProps');
  return {
    data: {
      ssr: 'http://127.0.0.1:7001',
      csr: 'http://127.0.0.1:8000',
    },
  };
};

export default Page;
