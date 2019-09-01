import React from 'react';
import { formatMessage, FormattedMessage, getLocale, setLocale } from 'umi-plugin-react/locale';
import { IUi } from 'umi-types';
import Helmet from 'react-helmet';
import cls from 'classnames';
import ErrorBoundary from '@/components/ErrorBoundary';
import Context from './Context';
import Footer from './Footer';
import { THEME } from '@/enums';

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
  constructor(props: ILayoutProps) {
    super(props);
    this.state = {
      theme: 'dark',
    };
  }

  setTheme = (theme: IUi.ITheme) => {
    if (Object.keys(THEME).includes(theme)) {
      this.setState({
        theme,
      });
    }
  };

  showLogPanel = () => {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.emit('SHOW_LOG');
    }
  };

  hideLogPanel = () => {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.emit('HIDE_LOG');
    }
  };

  render() {
    const locale = getLocale();
    const { theme } = this.state;
    const { type, className, title } = this.props;
    const currentProject = window.g_uiCurrentProject || {};
    const layoutCls = cls(locale, 'ui-layout', className);
    window.g_uiContext = Context;
    // TODO: using config plugin register
    const framework = window.g_bigfish ? 'Bigfish UI' : 'Umi UI';
    const icon = window.g_bigfish
      ? '//gw.alipayobjects.com/zos/antfincdn/hGDyUOjsDS/430be478-0a70-4e82-99cc-b2ec526bfff2.png'
      : '//gw.alipayobjects.com/zos/antfincdn/KjbXlRsRBz/umi.png';

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
            formatMessage,
            currentProject,
            showLogPanel: this.showLogPanel,
            hideLogPanel: this.hideLogPanel,
            setTheme: this.setTheme,
            setLocale,
            FormattedMessage,
          }}
        >
          <Helmet>
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
