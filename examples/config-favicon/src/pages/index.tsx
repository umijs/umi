import React from 'react';
import type { FC } from 'react';

const IndexPage: FC = () => {
  return (
    <div>
      <h2>Config favicon in umijs.</h2>
      <p>
        Configure the favicon address (href attribute) in `.umirc.ts` (the umi
        config file)
      </p>
      <pre>
        {`import { defineConfig } from 'umi';

export default defineConfig({
  favicon: '/assets/favicon.svg',
});`}
      </pre>
      <p>Then, umi will generate the same line like below in `.html` file.</p>
      <pre>
        {`<link rel="shortcut icon" type="image/x-icon" href="/assets/favicon.svg" />`}
      </pre>
      <br />
      <p>
        If you want to use local pictures, please put them in the `public`
        directory.
      </p>
    </div>
  );
};

export default IndexPage;
