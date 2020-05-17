import React from 'react';

const Bar = props => {
  console.log('Bar', props);
  return (
    <h2>{props.title}</h2>
  );
};

Bar.getInitialProps = async () => {
  console.log('Bar getInitialProps');
  return {
    title: 'Bar',
  };
};

export default Bar;
