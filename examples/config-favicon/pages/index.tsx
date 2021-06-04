import React from 'react';
import type { FC } from 'react';

const IndexPage: FC = () => {
  return (
    <div>
      <p>
        in <code>.umirc.ts/config/config.ts</code> file
      </p>
      <pre>
        {`import { defineConfig } from 'umi';

export default defineConfig({
  // favicon: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
  favicon: './favicon.png',
});
`}
      </pre>
      <p>
        If you want to use local pictures, please put them in the public
        directory
      </p>
      <p>
        You can also use remote resources, such as
        https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg
      </p>
    </div>
  );
};

export default IndexPage;
