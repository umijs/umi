import React from 'react';
import type { FC } from 'react';

const IndexPage: FC = () => {
  return (
    <div>
      <p>
        By configuring <a href="https://umijs.org/config#define">define</a>,
        example:
      </p>
      <p>
        <pre>
          {`
        export default {
          define: {
            REACT_APP: process.env.REACT_APP
          },
        };          
        `}
        </pre>
      </p>
      <p>
        In this way, the REACT_APP variable can be accessed in the component.
      </p>
      <p>
        You can use define config to set different values based on environment
        variables
      </p>
      <p>
        When you use yarn start, will use config.dev.ts and the MESSAGE in
        define config is set to 'hello world from dev'
      </p>
      <p>
        Similarly, when using yarn build, the MESSAGE in define config is set to
        'hello world form production'
      </p>
      <p>
        The current MESSAGE is <strong>{MESSAGE}</strong>
      </p>
    </div>
  );
};

export default IndexPage;
