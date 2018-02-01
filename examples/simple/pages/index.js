import Link from 'umi/link';
import { Button } from 'antd';
import styles from './index.css';

export default () => (
  <div className={styles.normal}>
    Index Page
    <br />
    <Link to="/list">
      <Button type="primary">go to /list</Button>
    </Link>
  </div>
);
