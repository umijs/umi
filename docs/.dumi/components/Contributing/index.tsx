import { Link } from 'umi';
import { SectionHeader } from '../SectionHeader';
import styles from './index.less';

export const Contributing = () => {
  return (
    <div className={styles.contributing}>
      <SectionHeader title="参与建设" />
      <div>
        <p className="contributing-text">
          社区有非常多小伙伴在和我们一同建设 Umi，如果你有兴趣，欢迎&nbsp;
          <Link to="/docs/introduce/contributing">加入我们</Link> 。
        </p>
        <div>
          <a href="https://github.com/umijs/umi/graphs/contributors">
            <img
              src="https://contrib.rocks/image?repo=umijs/umi"
              width="812"
              alt="Umi contributors"
            />
          </a>
        </div>
      </div>
    </div>
  );
};
