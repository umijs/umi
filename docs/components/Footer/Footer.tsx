import React from 'react';
// @ts-ignore
import { Link } from 'umi';
import NewsLetterForm from './NewsLetterForm';
// @ts-ignore
import styles from './Footer.css';

export default () => {
  return (
    <div className={styles.normal}>
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.line}>
            <h3>Docs</h3>
            <div>
              <a target="_blank" href="https://fb.umijs.org">
                Feedback
              </a>{' '}
              ·{' '}
              <a target="_blank" href="https://github.com/umijs/umi/issues">
                Report a Bug
              </a>{' '}
              · <Link to="/docs/introduce/contributing">Contribute to Umi</Link>{' '}
              ·{' '}
              <Link to="/docs/introduce/upgrade-to-umi-4">
                Upgrade to Umi 4
              </Link>
            </div>
          </div>
          <div className={styles.line}>
            <h3>Ecosystem</h3>
            <div>
              <Link to="/blog">Development Log</Link> · Team · Milestones ·{' '}
              <a target="_blank" href="https://qiankun.umijs.org/">
                Qiankun
              </a>
            </div>
          </div>
          <div className={styles.line}>
            <h3>Resources</h3>
            <div>
              <Link to="/docs/introduce/introduce">Documentation</Link> ·
              Examples · Plugins ·{' '}
              <a target="_blank" href="https://github.com/umijs/umi/releases">
                Release Notes
              </a>
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <NewsLetterForm />
          <div className={styles.copyright}>
            Open-source MIT Licensed · Copyright © 2017-present
          </div>
        </div>
      </div>
    </div>
  );
};
