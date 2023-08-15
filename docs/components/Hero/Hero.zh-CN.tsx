import React from 'react';
import { TextLoop } from 'react-text-loop-next';
import GithubStar from './GithubStar';
// @ts-ignore
import { Link } from 'umi';
// @ts-ignore
import styles from './Hero.css';

export default () => {
  // TODO: github stars 存 localStorage
  //  采用 stale-while-revalidate 的策略
  return (
    <div className={styles.normal}>
      <div className={styles.bg} />
      <div className={styles.wrapper}>
        <div className={styles.left}>
          <div className={styles.bigLogo} />
          <div className={styles.actions}>
            <Link to="/docs/tutorials/getting-started">
              <div className={styles.button}>快速上手 →</div>
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
            用 Umi 构建你的下一个{' '}
            <TextLoop>
              <strong>React</strong>
              <strong>Vue</strong>
              <strong>PC</strong>
              <strong>Mobile</strong>
              <strong>SPA</strong>
              <strong>SSR</strong>
              <strong>CSR</strong>
              <strong>中后台</strong>
            </TextLoop>{' '}
            应用
          </div>
          <div className={styles.slogan}>
            带给你<strong>简单</strong>而<strong>愉悦</strong>的 Web 开发体验
          </div>
          <div className={styles.bow} />
        </div>
      </div>
    </div>
  );
};
