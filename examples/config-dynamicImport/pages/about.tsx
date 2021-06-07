import type { FC } from 'react';
import React from 'react';
import { Link } from 'umi';

const IndexPage: FC = () => {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: '24px' }}>Umi Contributors</p>
      <p style={{ margin: '16px 0' }}>
        This project exists thanks to all the people who contribute.{' '}
        <a target="_blank" href="https://umijs.org/docs/contributing">
          Join us!
        </a>
      </p>
      <a
        href="https://github.com/umijs/umi/graphs/contributors"
        target="_blank"
      >
        <img
          width="80%"
          src="https://opencollective.com/umi/contributors.svg?width=960&button=false"
        />
      </a>
      <br />
      <Link to="/">Go to Home!</Link>
    </div>
  );
};

export default IndexPage;
