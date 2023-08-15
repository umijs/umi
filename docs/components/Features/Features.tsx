import SectionHeader from '@/docs/components/SectionHeader/SectionHeader';
import React from 'react';
// @ts-ignore
import styles from './Features.css';

export default () => {
  // prettier-ignore
  return (
    <div className={styles.normal}>
      <SectionHeader title="Main Features" />
      <ul>
        <li className={styles.feature}>
          <div></div>
          <h3>Out of the Box</h3>
          <p>
            Built-in routing, building, deployment, testing, linting, and more. Start developing with just a Umi dependency.
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Enterprise-Grade</h3>
          <p>
            Choice of over 10,000 applications within the Ant Group. Also extensively used in companies such as Alibaba, ByteDance, Tencent, NetEase, Meituan, and Kuaishou.
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Best Practices</h3>
          <p>
            Built-in best practices including micro-frontends, data flows, permissions, internationalization, icons solution, analytics, antd, requests, CSS solutions, charts, and more.
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Extensible</h3>
          <p>
            Umi provides a complete lifecycle of web application development and makes it plugin-friendly. Even internal features of Umi are implemented as plugins.
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Comprehensive Routing</h3>
          <p>
            Built on top of React Router 6, similar to Remix, supporting nesting, dynamic routing, dynamic optional routing, preloading, and route-based request optimization.
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Natively Fast</h3>
          <p>
            MFSU solves the slow Webpack compilation problem, and esbuild handles performance issues related to compression, configuration, testing, and runtime...
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Dual Build Engines</h3>
          <p>
            Provides both Vite and Webpack as build options for developers, aiming to ensure consistency in functionality between the two.
          </p>
        </li>
        <li className={styles.feature}>
          <div></div>
          <h3>Pre-Bundled Dependencies</h3>
          <p>
            Umi pre-bundles dependencies, ensuring dependency locking and regular updates, making each version of the framework usable even after 10 years.
          </p>
        </li>
      </ul>
    </div>
  );
};
