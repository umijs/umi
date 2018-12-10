import { connect } from 'dva';
import NavLink from 'umi/navlink';
import styles from './index.less';

export default connect(state => ({
  service: state.service,
}))(props => {
  return (
    <div className={styles.normal}>
      <div className={styles.header}>
        <img
          className={styles.logo}
          src="https://gw.alipayobjects.com/zos/rmsportal/lbZMwLpvYYkvMUiqbWfd.png"
        />
        umi ui
        <sup>alpha</sup>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.sidebar}>
          <ul>
            {props.service.panels.map((panel, i) => {
              return (
                <li key={i}>
                  <NavLink activeClassName={styles.active} to={panel.path}>
                    {panel.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
        <div className={styles.main}>{props.children}</div>
      </div>
    </div>
  );
});
