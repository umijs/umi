import React from 'react';
import { TextLoop } from 'react-text-loop-next';
import GithubStar from './GithubStar';
// @ts-ignore
import { Link } from 'umi';
// @ts-ignore
import styles from './Hero.css';

export default () => {
  // TODO: Save github stars to localStorage
  // Using the stale-while-revalidate strategy
  return (
    <div className={styles.normal}>
      <div className={styles.bg} />
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.bigLogo} />
          <div className={styles.actions}>
            <Link to="/docs/tutorials/getting-started">
              <div className={styles.button}>Get Started →</div>
            </Link>
            <div className={styles.githubStar}>
              <GithubStar />
            </div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.bigSlogan1}></div>
          <div className={styles.bigSlogan2}></div>
          <div className={styles.slogan}>
            Build your next with Umi{' '}
            <TextLoop>
              <strong>React</strong>
              <strong>Vue</strong>
              <strong>PC</strong>
              <strong>Mobile</strong>
              <strong>SPA</strong>
              <strong>SSR</strong>
              <strong>CSR</strong>
              <strong>Enterprise</strong>
            </TextLoop>{' '}
            applications
          </div>
          <div className={styles.slogan}>
            Providing you with a <strong>simple</strong> and{' '}
            <strong>pleasant</strong> web development experience
          </div>
          <div className={styles.bow} />
        </div>
      </div>
    </div>
  );
};
