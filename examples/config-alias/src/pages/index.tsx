import { Header } from '@/components';
import { Footer } from 'component';
import type { FC } from 'react';
import React from 'react';

const IndexPage: FC = () => {
  return (
    <div>
      <Header />
      <p>Create aliases to import or require certain modules more easily. </p>
      <p>For example, to alias a bunch of commonly used `component` folders:</p>
      <p>We added configuration in ```.umijs.ts```</p>
      <pre>
        {`import { defineConfig } from 'umi';

export default defineConfig({
  alias: {
    component: require.resolve('./src/components'),
  }
});`}
      </pre>
      <p>Now, instead of using relative paths when importing like so:</p>
      <code>{`import { Footer } from '../components';`}</code>
      <p>you can use the alias:</p>
      <code>{`import { Footer } from 'component';`}</code>
      <br />
      <p>umi has the following built-in alias:</p>
      <ul>
        <li>
          <code>@</code>, project `src` directory.
        </li>
        <li>
          <code>@@</code>，temporary directory，It's usually{' '}
          <code>src/.umi</code> directory.
        </li>
        <li>
          <code>umi</code>，project root directory.
        </li>
        <li>
          <code>react-router</code> and <code>react-router-dom</code>，for lock
          version
        </li>
        <li>
          <code>react</code> and <code>react-dom</code>，It's usually{' '}
          <code>16.x</code> version，However, if there are dependencies in the
          project, the dependent version in the project will be used first
        </li>
      </ul>
      <Footer />
    </div>
  );
};

export default IndexPage;
