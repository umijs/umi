import { Icon } from '@ant-design/compatible';
import { Menu, Layout, Dropdown, Button, message, Tooltip, Row, Col } from 'antd';
import { Left, CaretDown, Export } from '@ant-design/icons';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import React, { useState, useEffect, useContext } from 'react';
import get from 'lodash/get';
import { NavLink, withRouter } from 'umi';
import { setCurrentProject, openInEditor } from '@/services/project';
import { Redirect } from '@/components/icons';
import { callRemote } from '@/socket';
import { handleBack, getProjectStatus } from '@/utils';
import ErrorBoundary from '@/components/ErrorBoundary';
import Context from './Context';
import UiLayout from './Layout';
import styles from './Dashboard.less';

const { Content, Sider, Header } = Layout;

function getActivePanel(pathname) {
  for (const panel of window.g_service.panels) {
    if (panel.path === pathname) {
      return panel;
    }
  }
  return null;
}

export default withRouter(props => {
  const _log = window.g_uiDebug.extend('Dashboard');
  const { pathname } = props.location;
  const activePanel = getActivePanel(pathname) ? getActivePanel(pathname) : {};
  const [selectedKeys, setSelectedKeys] = useState([activePanel ? activePanel.path : '/']);

  useEffect(
    () => {
      const currPanel = getActivePanel(pathname);
      setSelectedKeys([currPanel ? currPanel.path : '/']);
    },
    [pathname],
  );

  const projectMaps = window.g_uiProjects || {};
  const { search } = window.location;

  _log('projectsprojects', projectMaps);

  const changeProject = async ({ key }) => {
    if (key) {
      await handleBack(true, `/dashboard${search}`);
      await setCurrentProject({
        key,
      });
    }
  };

  const title = activePanel.title ? formatMessage({ id: activePanel.title }) : '';

  return (
    <UiLayout type="detail" title={title}>
      <Context.Consumer>
        {({ currentProject, theme, isMini }) => {
          const openEditor = async () => {
            if (currentProject && currentProject.key) {
              await openInEditor({
                key: currentProject.key,
              });
            }
          };

          const projects = Object.keys(projectMaps);

          const recentMenu = (
            <Menu theme={theme} className={styles['sidebar-recentMenu']}>
              <Menu.Item key="openInEdit" onClick={openEditor}>
                <p>{formatMessage({ id: 'org.umi.ui.global.project.editor.open' })}</p>
              </Menu.Item>
              {projects.length > 0 && <Menu.Divider />}
              <Menu.ItemGroup
                key="projects"
                title={
                  projects.length > 1
                    ? formatMessage({ id: 'org.umi.ui.global.panel.recent.open' })
                    : formatMessage({ id: 'org.umi.ui.global.panel.recent.open.empty' })
                }
              >
                {currentProject &&
                  projects
                    .filter(
                      p =>
                        p !== currentProject.key && getProjectStatus(currentProject) === 'success',
                    )
                    .sort(
                      (a, b) =>
                        get(projectMaps, `${b}.opened_at`, new Date('2002').getTime()) -
                        get(projectMaps, `${a}.opened_at`, new Date('2002').getTime()),
                    )
                    .slice(0, 5)
                    .map(project => (
                      <Menu.Item key={project} onClick={changeProject}>
                        <p>{get(projectMaps, `${project}.name`, '未命名')}</p>
                      </Menu.Item>
                    ))}
              </Menu.ItemGroup>
            </Menu>
          );

          return (
            <div className={styles.normal}>
              {isMini && (
                <Row
                  type="flex"
                  align="middle"
                  justify="space-between"
                  className={styles['mini-header']}
                >
                  <Col>
                    <p className={styles['mini-header-name']}>
                      {currentProject ? currentProject.name : ''}
                    </p>
                    <Tooltip title={formatMessage({ id: 'org.umi.ui.global.project.editor.open' })}>
                      <Export onClick={openEditor} />
                    </Tooltip>
                  </Col>
                  <Col className={styles.gotoUi}>
                    <a target="_blank" rel="noopener noreferrer" href={window.location.origin}>
                      <Redirect />
                      <span>进入完整版</span>
                    </a>
                  </Col>
                </Row>
              )}
              <Layout>
                <Row type="flex" className={styles.wrapper}>
                  <Sider className={styles.sidebar} collapsed={isMini} collapsedWidth={64}>
                    {!isMini && (
                      <div className={styles['sidebar-name']}>
                        <Left
                          onClick={() => handleBack(false)}
                          className={styles['sidebar-name-back']}
                        />
                        <Dropdown
                          placement="bottomRight"
                          trigger={['click']}
                          overlay={recentMenu}
                          className={styles['sidebar-name-dropdown']}
                        >
                          <div>
                            <p>{currentProject ? currentProject.name : ''}</p>
                            <CaretDown className={styles['sidebar-name-expand-icon']} />
                          </div>
                        </Dropdown>
                      </div>
                    )}
                    <Menu
                      theme="light"
                      selectedKeys={selectedKeys}
                      onClick={({ key }) => {
                        setSelectedKeys([key]);
                      }}
                      style={{
                        border: 0,
                      }}
                      mode="inline"
                    >
                      {window.g_service.panels.map(panel => {
                        const icon =
                          typeof panel.icon === 'object' ? panel.icon : { type: panel.icon };
                        return (
                          <Menu.Item key={panel.path}>
                            <NavLink exact to={`${panel.path}${search}`}>
                              <Icon className={styles.menuIcon} {...icon} />
                              {isMini ? (
                                <p className={styles.menuItem}>
                                  {' '}
                                  <FormattedMessage id={panel.title} />
                                </p>
                              ) : (
                                <span className={styles.menuItem}>
                                  <FormattedMessage id={panel.title} />
                                </span>
                              )}
                            </NavLink>
                          </Menu.Item>
                        );
                      })}
                    </Menu>
                  </Sider>
                  <Content className={styles.main}>
                    <div className={styles.header}>
                      <h1>{activePanel && title}</h1>
                      {Array.isArray(activePanel.actions) && activePanel.actions.length > 0 && (
                        <div className={styles['header-actions']}>
                          {activePanel.actions.map((panelAction, j) => {
                            const { title, action, onClick, ...btnProps } = panelAction;
                            const handleClick = async () => {
                              // TODO: try catch handler
                              try {
                                await callRemote(action);
                                if (onClick) {
                                  onClick();
                                }
                              } catch (e) {
                                message.error(e && e.message ? e.message : 'error');
                              }
                            };
                            return (
                              <Button key={j.toString()} onClick={handleClick} {...btnProps}>
                                {formatMessage({ id: title })}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {/* key pathname change transition will crash  */}
                    <div key={activePanel.path || '/'} className={styles.content}>
                      <ErrorBoundary className={styles['dashboard-error-boundary']}>
                        {props.children}
                      </ErrorBoundary>
                    </div>
                  </Content>
                </Row>
              </Layout>
            </div>
          );
        }}
      </Context.Consumer>
    </UiLayout>
  );
});
