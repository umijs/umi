import { Link } from 'umi';
import styles from './index.css';

function Page(props) {
  return (
    <div className={styles.normal}>
      <h1>Global Layout</h1>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/users">Users</Link></li>
        <li><Link to="/count">Count</Link></li>
      </ul>
      {
        props.children
      }
    </div>
  );
}

export default Page;
