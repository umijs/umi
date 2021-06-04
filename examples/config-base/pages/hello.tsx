import React from 'react';
import type { FC } from 'react';
import { Link } from 'umi';

const HelloPage: FC = () => {
  return (
    <div>
      <h1>Hello Page</h1>
      <h2>
        Look at the address of the browser. It should be{' '}
        <code>/some/hello</code> at this time.
      </h2>
      <Link to="/">Go Back!</Link>
    </div>
  );
};

export default HelloPage;
