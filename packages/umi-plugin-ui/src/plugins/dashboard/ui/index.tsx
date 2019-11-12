import React from 'react';
import cls from 'classnames';
import { IUiApi } from 'umi-types';
import { Close, Smile } from '@ant-design/icons';
import { Card, Row, Col } from 'antd';
import styles from './ui.module.less';

const { useState, useRef, useEffect } = React;

interface IProps {
  api: IUiApi;
}

const DashboardUI: React.FC<IProps> = props => {
  // TODO react-grid-layout to custom layout
  const isClosed = window.localStorage.getItem('umi_ui_dashboard_welcome') || false;
  const [closed, setClosed] = useState<boolean>(!!isClosed);
  const { api } = props;
  const { redirect, currentProject, _, intl, getBasicUI = () => ({}) } = api;
  const { FormattedMessage } = intl;
  const actionCardCls = cls(styles.card, styles['card-action']);
  const welcomeCardCls = cls(styles.card, styles.welcome);
  const basicUI = getBasicUI();

  const actionCards = [
    {
      className: actionCardCls,
      title: (
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.dev)} />
          <div className={styles.info}>
            <h4>{intl({ id: 'org.umi.ui.dashboard.panel.dev.title' })}</h4>
            <p>{intl({ id: 'org.umi.ui.dashboard.panel.dev.desc' })}</p>
          </div>
        </div>
      ),
      body: (
        <div onClick={() => redirect('/tasks')}>
          <FormattedMessage id="org.umi.ui.dashboard.panel.goto.task" />
        </div>
      ),
    },
    {
      className: actionCardCls,
      title: (
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.build)} />
          <div className={styles.info}>
            <h4>{intl({ id: 'org.umi.ui.dashboard.panel.build.title' })}</h4>
            <p>{intl({ id: 'org.umi.ui.dashboard.panel.build.desc' })}</p>
          </div>
        </div>
      ),
      body: (
        <div onClick={() => redirect('/tasks?active=build')}>
          {intl({ id: 'org.umi.ui.dashboard.panel.goto.task' })}
        </div>
      ),
    },
    {
      className: actionCardCls,
      title: (
        <div className={styles.future}>
          <div>
            <Smile />
          </div>
          <p>{intl({ id: 'org.umi.ui.dashboard.panel.coming.soon' })}</p>
        </div>
      ),
    },
  ];

  if (!closed) {
    actionCards.unshift({
      className: welcomeCardCls,
      size: 'small',
      // extra: <Close className={styles.close} onClick={handleClose} />,
      body: (
        <div>
          <h2>Hi</h2>
          <p>
            {intl(
              {
                id: 'org.umi.ui.dashboard.panel.welcome.title',
              },
              {
                name: currentProject.name,
              },
            )}
          </p>
          <div>
            <a href="https://umijs.org/guide/umi-ui.html" target="_blank" rel="noopener noreferrer">
              {basicUI.name || 'Umi'} UI
            </a>
            {intl({ id: 'org.umi.ui.dashboard.panel.welcome.desc' })}
          </div>
        </div>
      ),
    });
  }

  return (
    <div className={styles.container}>
      <Row className={styles['container-row']} type="flex" gutter={24}>
        {actionCards.map((card, i) => {
          const { className, body, ...restProps } = card;
          return (
            <Col key={i.toString()} className={className} xs={12} sm={12} md={12} lg={12} xl={6}>
              <Card
                className={styles.card}
                bordered={false}
                hoverable={false}
                children={body}
                {...restProps}
              />
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default DashboardUI;
