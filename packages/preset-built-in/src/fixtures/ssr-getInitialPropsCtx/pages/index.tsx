import React from 'react';

const TestParams = props => {
  const { fromServerTitle } = props;

  return (
    <div>
      <h1>{fromServerTitle}</h1>
    </div>
  );
};

TestParams.getInitialProps = async (props) => {
  const { fromServerTitle } = props;
  return {
    fromServerTitle,
  };
};

export default TestParams;
