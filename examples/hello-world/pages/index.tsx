import type { FC } from 'react';
import React from 'react';
import { Link } from 'umi';

const IndexPage: FC = () => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '20px 0 40px 0',
      }}
    >
      <h1 style={{ fontSize: '48px' }}>UmiJS</h1>
      <p style={{ margin: '16px 0' }}>
        🍙 Extensible enterprise-level front-end application framework.
      </p>
      <Link to="/about">About Us →</Link>
    </div>
  );
};

export default IndexPage;
