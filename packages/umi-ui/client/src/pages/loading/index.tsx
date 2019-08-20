import React, { Fragment } from 'react';
import { Spin, Button } from 'antd';
import { callRemote } from '@/socket';
import { getLocale } from 'umi-plugin-react/locale';
import history from '@tmp/history';
import locales from './locales';
import styles from './index.less';
import Fail from './fail';

interface ILoadingProps {
  data?: object;
  message?: string;
  error?: {
    message: string;
  };
}

interface ILoadingState {
  actionLoading?: boolean;
}

export default class Loading extends React.Component<ILoadingProps, ILoadingState> {
  state = {
    actionLoading: false,
  };
  handleInstallDeps = () => {
    this.setState({
      actionLoading: true,
    });
    setTimeout(() => {
      // TODO
      this.setState({
        actionLoading: false,
      });
    }, 3000);
  };

  handleBackProjectList = () => {
    history.replace('/project/select');
    window.location.reload();
  };

  render() {
    const locale = getLocale();
    const { error } = this.props;
    const { actionLoading } = this.state;
    const messages = locales[locale] || locales['zh-CN'];

    const actionsDeps = (
      <div>
        <Button onClick={this.handleInstallDeps} loading={actionLoading} type="primary">
          {actionLoading ? '依赖安装中...' : '安装依赖'}
        </Button>
        <Button onClick={this.handleBackProjectList}>返回列表</Button>
      </div>
    );

    return (
      <div className={styles.loading}>
        {error ? (
          <Fail title="打开项目失败" description={error.message || ''} actions={actionsDeps} />
        ) : (
          <Fragment>
            <div className={styles['loading-spin']}>
              <Spin size="large" />
              <p>{messages['org.umi.ui.loading.open']}</p>
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}
