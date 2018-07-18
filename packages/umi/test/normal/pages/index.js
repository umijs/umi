import Link from 'umi/link';
import styles from './index.css';

export default () => (
  <>
    <h1 className={`${styles.a} b`}>{window.g_page_title}</h1>
    <hr />
    <div id="test-images" style={{ display: 'flex' }}>
      <img alt="" width="200" height="200" src={require('../assets/dva.jpg')} />
      <div>
        <img alt="" src={require('../assets/antd.png')} />
      </div>
      <div className="yuque" />
      <div className="roadhog" />
    </div>
    <hr />
    <Link to="/list">
      <button>go to /list</button>
    </Link>
  </>
);
