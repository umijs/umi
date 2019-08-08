import React from 'react';
import { Icon } from 'antd';
import { formatMessage, FormattedMessage, getLocale, setLocale } from 'umi-plugin-react/locale';
import { IUi } from 'umi-types';
import Context from './Context';
import Footer from './Footer';
import styles from './Layout.less';
import { PROJECT_STATUS, IProjectStatus, LOCALES } from '@/enums';

interface ILayoutProps {}

interface ILayoutState {
  logVisible: boolean;
}

class Layout extends React.Component<ILayoutProps, ILayoutState> {
  constructor(props) {
    super(props);
    this.state = {
      logVisible: false,
    };
  }
  openLog = () => {
    this.setState({
      logVisible: true,
    });
  };
  hideLog = () => {
    this.setState({
      logVisible: false,
    });
  };
  render() {
    const locale = getLocale();
    const { logVisible } = this.state;
    window.g_uiContext = Context;

    return (
      <Context.Provider
        value={{
          locale,
          formatMessage,
          openLog: this.openLog,
          hideLog: this.hideLog,
          setLocale,
          FormattedMessage,
        }}
      >
        {this.props.children}
        <Footer logVisible={logVisible} openLog={this.openLog} hideLog={this.hideLog} />
      </Context.Provider>
    );
  }
}

export default Layout;
