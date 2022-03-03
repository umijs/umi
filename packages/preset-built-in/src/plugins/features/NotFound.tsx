import type { FC } from 'react';
import React from 'react';
import { Link } from 'umi';

const NoFoundPage: FC = () => {
  return (
    <div>
      <h1>404</h1>
      <p>Hi, you're here, we don't have a 'about' page in this project. </p>
      <p>
        That's it. When you visit a non-existent page in a contractual project,
        you will arrive here.
      </p>
      <p>
        If you don't need this feature, you can turn it off by configuring it.
      </p>
      <p>
        Don't worry, this page will only appear in the development environment.
      </p>
      <p>
        If you want to customize the 404 page and display it for users in
        production, you can refer{' '}
        <a href="https://umijs.org/docs/convention-routing#404-routing">
          {' '}
          here{' '}
        </a>
      </p>
      <br />
      <br />
      <Link to="/">Go Back!</Link>
    </div>
  );
};

export default NoFoundPage;
