import React from 'react';
import { formatMessage, FormattedMessage, getLocale, setLocale } from 'umi-plugin-react/locale';
import { IUi } from 'umi-types';
import Context from './Context';
import Footer from './Footer';
import { THEME } from '@/enums';

interface ILayoutProps {
  /** Layout 类型（项目列表、项目详情） */
  type: 'detail' | 'list';
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
    const { type } = this.props;
    window.g_uiContext = Context;

    return (
      <Context.Provider
        value={{
          locale,
          theme,
          formatMessage,
          showLogPanel: this.showLogPanel,
          hideLogPanel: this.hideLogPanel,
          setTheme: this.setTheme,
          setLocale,
          FormattedMessage,
        }}
      >
        {this.props.children}
        <Footer type={type} />
      </Context.Provider>
    );
  }
}

export default Layout;
