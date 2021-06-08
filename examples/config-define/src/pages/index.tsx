import React from 'react';
import type { FC } from 'react';

const IndexPage: FC = () => {
  return (
    <div>
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
