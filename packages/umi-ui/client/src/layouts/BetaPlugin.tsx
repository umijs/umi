import React from 'react';
import { Icon } from '@ant-design/compatible';
import { Menu, Dropdown } from 'antd';
import { ExperimentFilled } from '@ant-design/icons';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { NavLink } from 'umi';
import { renderLocale } from '@/utils';

import styles from './Dashboard.less';

const renderLocaleText = renderLocale(formatMessage);

export interface BetaPluginProps {
  betaPanels: any[];
  overlay: any;
  selectedKeys: string[];
  isMini: boolean;
  search: string;
}

const BetaPlugin: React.SFC<BetaPluginProps> = props => {
  const { betaPanels = [], overlay, selectedKeys, isMini, search } = props;

  return (
    <>
      {Array.isArray(betaPanels) && betaPanels.length > 0 && (
        <div className={styles['sidebar-lab']}>
          {isMini ? (
            <Menu
              theme="light"
              selectedKeys={selectedKeys}
              style={{
                border: 0,
              }}
              selectable={false}
              mode="inline"
            >
              <Menu.SubMenu
                key="lab_subMenu"
                title={
                  <span>
                    <ExperimentFilled className={styles.menuIcon} />
                    <p>
                      <FormattedMessage id="org.umi.ui.global.dashboard.lab" />
                    </p>
                  </span>
                }
              >
                {betaPanels.map((panel, i) => {
                  const icon = typeof panel.icon === 'object' ? panel.icon : { type: panel.icon };
                  return (
                    <Menu.Item key={panel.path}>
                      <NavLink exact to={`${panel.path}${search}`}>
                        <Icon className={styles.menuIcon} {...icon} />
                        <span style={{ marginLeft: 8 }} className={styles.menuItem}>
                          {renderLocaleText(panel.title)}
                        </span>
                      </NavLink>
                    </Menu.Item>
                  );
                })}
              </Menu.SubMenu>
            </Menu>
          ) : (
            <Dropdown
              overlay={overlay}
              placement="topLeft"
              getPopupContainer={node => node.parentNode}
            >
              <Menu
                theme="light"
                style={{
                  border: 0,
                }}
                selectable={false}
                mode="inline"
              >
                <Menu.Item>
                  <ExperimentFilled className={styles.menuIcon} />
                  <span className={styles.menuItem}>
                    <FormattedMessage id="org.umi.ui.global.dashboard.lab" />
                  </span>
                </Menu.Item>
              </Menu>
            </Dropdown>
          )}
        </div>
      )}
    </>
  );
};

export default BetaPlugin;
