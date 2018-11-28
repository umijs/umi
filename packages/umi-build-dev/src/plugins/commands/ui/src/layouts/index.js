import { connect } from 'dva';
import Link from 'umi/link';
import styles from './index.css';

export default connect(state => ({
  service: state.service,
}))(props => {
  return (
    <div className={styles.normal}>
      <div className={styles.sidebar}>
        <h2>sidebar</h2>
        <div>
          <Link to="/">Go to Home</Link>
        </div>
        {props.service.panels.map((panel, index) => {
          return (
            <div key={index}>
              <Link to={panel.path}>{panel.title}</Link>
            </div>
          );
        })}
      </div>
      <div className={styles.main}>
        <h2>main</h2>
        {props.children}
      </div>
    </div>
  );
});
