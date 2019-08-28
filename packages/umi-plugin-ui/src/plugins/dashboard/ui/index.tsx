import React from 'react';
import ReactDOM from 'react-dom';
import cls from 'classnames';
import { IUiApi } from 'umi-types';
import AutoResponsive from 'autoresponsive-react';
import { Close, Smile } from '@ant-design/icons';
import { Card } from 'antd';
import styles from './ui.module.less';

const { useState, useRef, useEffect } = React;

interface IProps {
  api: IUiApi;
}

const DashboardUI: React.FC<IProps> = props => {
  // TODO react-grid-layout to custom layout
  const isClosed = window.localStorage.getItem('umi_ui_dashboard_welcome') || false;
  const [closed, setClosed] = useState<boolean>(!!isClosed);
  const [containerWidth, setContainerWidth] = useState<number>();
  const containerRef = useRef();
  const { api } = props;
  const { redirect, currentProject, _, intl } = api;
  const actionCardCls = cls(styles.card, styles['card-action']);
  const welcomeCardCls = cls(styles.card, styles.welcome);

  useEffect(() => {
    const resizeContainerWidth = () => {
      setContainerWidth(ReactDOM.findDOMNode(containerRef.current).clientWidth);
    };
    // resizeContainerWidth();
    window.addEventListener('resize', resizeContainerWidth, false);
    return () => {
      window.removeEventListener('resize', resizeContainerWidth, false);
    };
  }, []);

  const handleClose = () => {
    setClosed(true);
    window.localStorage.setItem('umi_ui_dashboard_welcome', 'true');
  };

  console.log('containerWidth', containerWidth || document.body.clientWidth);

  const getAutoResponsiveProps = () => {
    return {
      itemMargin: 24,
      containerWidth: containerWidth || document.body.clientWidth,
      itemClassName: styles.card,
      gridWidth: 3,
      transitionDuration: '.3',
    };
  };

  const style = { width: 300, height: 150 };

  const actionCards = [
    {
      className: actionCardCls,
      style,
      title: (
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.build)} />
          <div className={styles.info}>
            <h4>{intl('org.umi.ui.dashboard.panel.build.title')}</h4>
            <p>{intl('org.umi.ui.dashboard.panel.build.desc')}</p>
          </div>
        </div>
      ),
      body: (
        <div onClick={() => redirect('/tasks?active=build')}>
          {intl('org.umi.ui.dashboard.panel.goto.task')}
        </div>
      ),
    },
    {
      className: actionCardCls,
      style,
      title: (
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.dev)} />
          <div className={styles.info}>
            <h4>{intl('org.umi.ui.dashboard.panel.dev.title')}</h4>
            <p>{intl('org.umi.ui.dashboard.panel.dev.desc')}</p>
          </div>
        </div>
      ),
      body: (
        <div onClick={() => redirect('/tasks')}>{intl('org.umi.ui.dashboard.panel.goto.task')}</div>
      ),
    },
    {
      className: actionCardCls,
      style,
      title: (
        <div className={styles.future}>
          <div>
            <Smile />
          </div>
          <p>{intl('org.umi.ui.dashboard.panel.coming.soon')}</p>
        </div>
      ),
    },
  ];

  if (!closed) {
    actionCards.unshift({
      style: {
        width: 300,
        height: 360,
      },
      className: welcomeCardCls,
      size: 'small',
      extra: <Close onClick={handleClose} />,
      body: (
        <div>
          <h2>Hi</h2>
          <p>
            {intl('org.umi.ui.dashboard.panel.welcome.title', {
              name: currentProject.name,
            })}
          </p>
          <div>{intl('org.umi.ui.dashboard.panel.welcome.desc')}</div>
        </div>
      ),
    });
  }

  return (
    <div className={styles.container}>
      <AutoResponsive ref={containerRef} {...getAutoResponsiveProps()}>
        {actionCards.map((card, i) => {
          const { style: wrapStyle, className, body, ...restProps } = card;
          return (
            <div key={i} style={wrapStyle} className={className}>
              <Card bordered={false} hoverable={false} children={body} {...restProps} />
            </div>
          );
        })}
      </AutoResponsive>
    </div>
  );
};

export default DashboardUI;
