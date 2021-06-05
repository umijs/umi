import type { FC } from 'react';
import React from 'react';
import { Link } from 'umi';

const IndexPage: FC = () => {
  return (
    <div
      style={{
        padding: '20px 0 40px 0',
      }}
    >
      <h1>UmiJS</h1>
      <p>In this example,we use the dynamicImport config,in .umirc.ts</p>
      <pre>
        {`export default {
  dynamicImport: {
  },
};
`}
      </pre>
      <p>when you run the command for 'umi build'.</p>
      <pre>{`.
├── index.html
├── p__about.js
├── p__index.js
└── umi.js
      `}</pre>
      <p>By default, umi's build looks like</p>
      <pre>{`.
├── index.html
└── umi.js
      `}</pre>
      <Link to="/about">About Us →</Link>
    </div>
  );
};

export default IndexPage;
