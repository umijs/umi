import React from 'react';

const Home = (props: any) => {
  return <div><h2>{props.message}</h2></div>;
};

Home.getInitialProps = async () => {
  return { message: 'prerender' }
};

export default Home;

