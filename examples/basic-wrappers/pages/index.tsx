import React from 'react';

const IndexPage = () => {
  return (
    <div>
      <h1>Index Page</h1>
      <p>
        You can't get here for the moment because of{' '}
        <code>IndexPage.wrappers = ['@/wrappers/auth']</code>
      </p>
    </div>
  );
};

IndexPage.wrappers = ['@/wrappers/auth'];

export default IndexPage;
