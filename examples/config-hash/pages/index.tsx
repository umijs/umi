import React from 'react';
import type { FC } from 'react';

const IndexPage: FC = () => {
  return (
    <div>
      <h2>hash config</h2>
      <p>
        Configure whether to include the hash suffix in the generated file,
        which is usually used for incremental publishing and to prevent the
        browser from loading the cache.
      </p>
      <p>
        If the set value is <strong>true</strong>, the product usually looks
        like this:
      </p>
      <pre>
        {`
  + dist
    - logo.sw892d.png
    - logo.sw892d.png
    - umi.df723s.js
    - umi.8sd8fw.css
    - index.html
        `}
      </pre>
      <p>Please note: HTML files are never hashed</p>
    </div>
  );
};

export default IndexPage;
