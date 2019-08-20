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
  handleInstallDeps = async () => {
    this.setState({
      actionLoading: true,
    });
    await callRemote({
      type: '@@actions/installDependencies',
      payload: {
        npmClient: 'yarn',
        projectPath: '/private/tmp/foooo',
      },
      onProgress(data) {
        console.log(`Install: ${data.install}`);
      },
    });
    this.setState({
      actionLoading: false,
    });
  };

  BACK_TO_HOME = () => {
    history.replace('/project/select');
    window.location.reload();
  };

  actionHandler = (handler: any) => {
    console.log('HANDLER', handler);
    callRemote(handler)
      .then(() => {
        alert('DONE');
      })
      .catch(e => {
        alert('FAILED');
        console.error(e);
      });
  };

  render() {
    const locale = getLocale();
    const { error } = this.props;
    const { actionLoading } = this.state;
    const messages = locales[locale] || locales['zh-CN'];

    const actionsDeps = error ? (
      <div>
        {(error.actions || []).map((action, index) => {
          return (
            <Button
              key={index}
              type={action.buttonType}
              onClick={
                action.browserHandler
                  ? this[action.browserHandler]
                  : this.actionHandler.bind(null, action.handler)
              }
            >
              {action.title}
            </Button>
          );
        })}
        <Button onClick={this.handleInstallDeps} loading={actionLoading} type="primary">
          {actionLoading ? '依赖安装中...' : '安装依赖'}
        </Button>
        <Button onClick={this.BACK_TO_HOME}>返回列表</Button>
      </div>
    ) : null;

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
