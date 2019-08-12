import React from 'react';
import { formatMessage, FormattedMessage, getLocale, setLocale } from 'umi-plugin-react/locale';
import { IUi } from 'umi-types';
import Context from './Context';
import Footer from './Footer';
import { THEME } from '@/enums';

interface ILayoutProps {}

interface ILayoutState {
  logVisible: boolean;
  theme: IUi.ITheme;
}

class Layout extends React.Component<ILayoutProps, ILayoutState> {
  constructor(props) {
    super(props);
    this.state = {
      logVisible: false,
      theme: 'dark',
    };
  }

  componentDidMount() {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.on('SHOW_LOG', () => {
        this.setState({
          logVisible: true,
        });
      });
      window.g_uiEventEmitter.on('HIDE_LOG', () => {
        this.setState({
          logVisible: false,
        });
      });
    }
  }

  componentWillUnmount() {
    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.removeListener('SHOW_LOG', () => {});
      window.g_uiEventEmitter.removeListener('HIDE_LOG', () => {});
    }
  }

  setTheme = (theme: IUi.ITheme) => {
    if (Object.keys(THEME).includes(theme)) {
      this.setState({
        theme,
      });
    }
  };

  showLogPanel = () => {
    this.setState({
      logVisible: true,
    });
  };

  hideLogPanel = () => {
    this.setState({
      logVisible: false,
    });
  };

  render() {
    const locale = getLocale();
    const { logVisible, theme } = this.state;
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
        <Footer
          logVisible={logVisible}
          showLogPanel={this.showLogPanel}
          hideLogPanel={this.hideLogPanel}
        />
      </Context.Provider>
    );
  }
}

export default Layout;
