import React from 'react';
import { formatMessage, FormattedMessage, setLocale } from 'umi-plugin-react/locale';
import { IUi } from 'umi-types';
import Helmet from 'react-helmet';
import querystring from 'querystring';
import cls from 'classnames';
import ErrorBoundary from '@/components/ErrorBoundary';
import history from '@tmp/history';
import Context from './Context';
import event, { MESSAGES } from '@/message';
import { isMiniUI, getLocale } from '@/utils/index';
import Footer from './Footer';
import { THEME, ILocale, LOCALES } from '../enums';

interface ILayoutProps {
  /** Layout 类型（项目列表、项目详情，loading 页） */
  type: 'detail' | 'list' | 'loading';
  className?: string;
  title?: string;
}

interface ILayoutState {
  theme: IUi.ITheme;
}

class Layout extends React.Component<ILayoutProps, ILayoutState> {
  public isMini: boolean;
  constructor(props: ILayoutProps) {
    super(props);
    this.isMini = isMiniUI();
    this.state = {
      theme: 'dark',
    };
  }

  componentWillUnmount() {
    event.removeAllListeners();
  }

  setTheme = (theme: IUi.ITheme) => {
    if (Object.keys(THEME).includes(theme)) {
      this.setState({
        theme,
      });
    }
  };

  showLogPanel = () => {
    if (event) {
      event.emit(MESSAGES.SHOW_LOG);
    }
  };

  hideLogPanel = () => {
    if (event) {
      event.emit(MESSAGES.HIDE_LOG);
    }
  };

  setLocale = (locale: ILocale, reload = false) => {
    if (Object.keys(LOCALES).indexOf(locale as string) > -1) {
      setLocale(locale, reload);
    }
  };

  render() {
    const locale = getLocale();
    const { theme } = this.state;
    const { type, className, title } = this.props;
    const currentProject = window.g_uiCurrentProject || {};
    const layoutCls = cls(
      locale,
      'ui-layout',
      {
        isMini: !!this.isMini,
      },
      className,
    );
    window.g_uiContext = Context;
    const { basicUI } = window.g_service;
    const frameworkName = basicUI.name || 'Umi';
    const framework = `${frameworkName} UI`;
    const icon = basicUI.logo_remote || '//gw.alipayobjects.com/zos/antfincdn/KjbXlRsRBz/umi.png';

    const getTitle = () => {
      if (title) {
        // dashboard plugin title
        if (currentProject.name && type !== 'list') {
          return `${title} - ${currentProject.name}`;
        }
        return `${title} - ${framework}`;
      }
      return framework;
    };

    return (
      <div className={layoutCls}>
        <Context.Provider
          value={{
            locale,
            theme,
            isMini: this.isMini,
            formatMessage,
            currentProject,
            showLogPanel: this.showLogPanel,
            hideLogPanel: this.hideLogPanel,
            setTheme: this.setTheme,
            setLocale: this.setLocale,
            FormattedMessage,
            basicUI,
          }}
        >
          <Helmet>
            <html lang={locale === 'zh-CN' ? 'zh' : 'en'} />
            <title>{getTitle()}</title>
            <link rel="shortcut icon" href={icon} type="image/x-icon" />
          </Helmet>
          <ErrorBoundary>{this.props.children}</ErrorBoundary>
          <ErrorBoundary>
            <Footer type={type} />
          </ErrorBoundary>
        </Context.Provider>
      </div>
    );
  }
}

export default Layout;
