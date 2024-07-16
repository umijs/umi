import { TextLoop } from 'react-text-loop-next';
import { Link } from 'umi';
import { GithubStar } from './GithubStar';
import styles from './index.less';

export const Hero = () => {
  return (
    <div className={styles.hero}>
      <div className="bg"></div>
      <div className="wrapper">
        <div className="left">
          <div className="bigLogo" />
          <div className="actions">
            <Link to="/docs/guides/getting-started">
              <div className="button">快速上手 →</div>
            </Link>
            <div className="githubStar">
              <GithubStar />
            </div>
          </div>
        </div>
        <div className="right">
          <div className="bigSlogan1"></div>
          <div className="bigSlogan2"></div>
          <div className="slogan">
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
          <div className="slogan">
            带给你<strong>简单</strong>而<strong>愉悦</strong>的 Web 开发体验
          </div>
          <div className="bow" />
        </div>
      </div>
    </div>
  );
};
