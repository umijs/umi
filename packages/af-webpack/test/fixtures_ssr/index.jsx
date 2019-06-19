import React from 'react';

const App = () => {
  return <div>Hello UmiJS SSR</div>;
};

App.getInitialProps = async () => {
  return Promise.all({
    data: {
      ssr: 'http://127.0.0.1:7001',
      csr: 'http://127.0.0.1:8000',
    },
  });
};

export default App;
