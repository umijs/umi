import SectionHeader from '@/docs/components/SectionHeader/SectionHeader';
import React from 'react';
// @ts-ignore
import { Link } from 'umi';
// @ts-ignore
import styles from './Contributing.css';

export default () => {
  return (
    <div className={styles.normal}>
      <SectionHeader title="Contributing" />
      <div>
        <p>
          There are many community members who are contributing to Umi. If
          you're interested, feel free to&nbsp;
          <Link to="/docs/introduce/contributing">join us</Link>.
        </p>
        <div>
          <a href="https://github.com/umijs/umi/graphs/contributors">
            <img
              src="https://opencollective.com/umi/contributors.svg?width=1200&button=false"
              width="1200"
              height="184"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
