import React, { startTransition, useEffect, version } from 'react';

const Home = () => {
  useEffect(() => {
    // startTransition is a new feature of React 18
    startTransition(() => {
      alert('Welcome to React version ' + version + ' !');
    });
  }, []);
  return <div>React version {version}</div>;
};

export default Home;
