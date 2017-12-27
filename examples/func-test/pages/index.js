import { Button } from 'antd-mobile';
import Link from 'umi/link';
import styles from './index.less';

export default function() {
  return (
    <div className={styles.normal}>
      <h1>Index Page</h1>
      <Link to="/list">
        <Button type="primary">跳转到列表页</Button>
      </Link>
    </div>
  );
}
