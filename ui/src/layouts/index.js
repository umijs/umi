import NavLink from 'umi/navlink';
import styles from './index.less';

export default props => {
  return (
    <div className={styles.normal}>
      <div className={styles.header}>
        <img
          alt="logo"
          className={styles.logo}
          src="https://gw.alipayobjects.com/zos/rmsportal/lbZMwLpvYYkvMUiqbWfd.png"
        />
        umi ui
        <sup>alpha</sup>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.sidebar}>
          <ul>
            <li key="999999">
              <NavLink activeClassName={styles.active} exact to="/">
                首页
              </NavLink>
            </li>
            {window.g_service.panels.map((panel, i) => {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i}>
                  <NavLink activeClassName={styles.active} exact to={panel.path}>
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
};
