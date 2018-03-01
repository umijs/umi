import { Button } from 'antd-mobile';
import Link from 'umi/link';
import styles from './index.less';

export default function() {
  return (
    <div className={styles.normal}>
      <h1>Index Page</h1>
      <div>
        <img src={require('../assets/umi.png')} />
      </div>
      <ul>
        <li>
          <Link to="/list">go to /list</Link>
        </li>
        <li>
          <Link to="/list.html">go to /list.html</Link>
        </li>
        <li>
          <Link to="/users/detail">go to /users/detail</Link>
        </li>
      </ul>
      <Button type="primary">一个没啥用的 Button</Button>
    </div>
  );
}
