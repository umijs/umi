import { Button } from 'antd-mobile';
import Link from 'umi/link';
import event, { Events } from 'umi/_event';
import styles from './index.less';

event.addEventListener(Events.PAGE_INITIALIZED, () => {
  console.log('mounted');
});

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
