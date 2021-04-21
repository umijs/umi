import React from 'react';

const TestParams: React.FC<{ fromServerTitle: string }> & {
  getInitialProps: (props: any) => any;
} = (props) => {
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
