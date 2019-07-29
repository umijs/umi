import { useState } from 'react';
import { NavLink, withRouter } from 'umi';
import { Menu, Icon } from 'antd';
import styles from './index.less';
import Terminal from './Terminal';
import Project from './Project';

function getActivePanel(pathname) {
  for (const panel of window.g_service.panels) {
    if (panel.path === pathname) {
      return panel;
    }
  }
  return null;
}

export default withRouter(props => {
  const { pathname } = props.location;
  if (pathname.startsWith('/project/')) {
    return <Project />;
  } else {
    const activePanel = getActivePanel(pathname);
    const [selectedKeys, setSelectedKeys] = useState([activePanel ? activePanel.path : '/']);
    return (
      <div className={styles.normal}>
        <div className={styles.wrapper}>
          <div className={styles.sidebar}>
            <div className={styles.logo}>
              <img
                alt="logo"
                className={styles.logo}
                src="https://gw.alipayobjects.com/zos/rmsportal/lbZMwLpvYYkvMUiqbWfd.png"
              />
            </div>
            <Menu
              selectedKeys={selectedKeys}
              onClick={({ key }) => {
                setSelectedKeys([key]);
              }}
              style={{
                border: 0,
              }}
            >
              <Menu.Item key="/">
                <Icon type="home" />
                首页
                <NavLink exact to="/dashboard">
                  首页
                </NavLink>
              </Menu.Item>
              {window.g_service.panels.map(panel => {
                return (
                  <Menu.Item key={panel.path}>
                    <Icon type={panel.icon} />
                    {panel.title}
                    <NavLink exact to={panel.path}>
                      {panel.title}
                    </NavLink>
                  </Menu.Item>
                );
              })}
            </Menu>
          </div>
          <div className={styles.main}>
            <h1>{activePanel ? activePanel.title : '首页'}</h1>
            <div className={styles.content}>{props.children}</div>
          </div>
        </div>
        <div className={styles.footer}>
          <Terminal />
          <div className={styles.statusBar}>
            <div className={styles.section}>
              <Icon type="folder" /> 当前位置
            </div>
            <div className={`${styles.section} ${styles.action} ${styles.log}`}>
              <Icon type="profile" /> 日志
            </div>
            <div className={styles.section}>
              <Icon type="bug" /> bbb
            </div>
          </div>
        </div>
      </div>
    );
  }
});
