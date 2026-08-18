import React from 'react';
// @ts-ignore
import { Helmet, Link } from 'umi';
// @ts-ignore
import fooStyles from './foo.less';
// @ts-ignore
import barStyles from './bar.css';

export default function HomePage() {
  return (
    <div>
      <Helmet>
        <title>helmet title</title>
      </Helmet>
      <div
        className={`${fooStyles.foo} ${fooStyles.foo2} ${fooStyles.foo3} ${barStyles.bar}`}
      >
        Home Page
      </div>
      <Link to="/page1">
        <h2>Page 1(/page1)</h2>
      </Link>
      <Link to="/page1.html">
        <h2>Page 1(/page1.html)</h2>
      </Link>
      <Link to="/page1/page1_1">
        <h2>Page 1-1(/page1/page1_1)</h2>
      </Link>
      <Link to="/page1/page1_1.html">
        <h2>Page 1-1(/page1/page1_1.html)</h2>
      </Link>
    </div>
  );
}
