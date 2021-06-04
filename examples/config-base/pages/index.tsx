import React from 'react';
import type { FC } from 'react';
import { Link } from 'umi';

const IndexPage: FC = () => {
  return (
    <div>
      <h1>Index Page</h1>
      <Link to="/hello">Go To Hello Page</Link>
    </div>
  );
};

export default IndexPage;
