import React, { Fragment } from 'react';
import { Spin, Button } from 'antd';
import { callRemote } from '@/socket';
import Layout from '@/layouts/Layout';
import { getLocale } from 'umi-plugin-react/locale';
import history from '@tmp/history';
import { findProjectPath } from '@/utils';
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
    const { data } = this.props;
    const path = findProjectPath(data);
    console.log('HANDLER', handler);
    callRemote({
      ...handler,
      onProgress(data) {
        console.log('Reinstall: ', data);
      },
    })
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
    const { error, data } = this.props;

    const { actionLoading } = this.state;
    const messages = locales[locale] || locales['zh-CN'];

    const actionsDeps = error ? (
      <div>
        <pre
          style={{
            maxWidth: 577,
            textAlign: 'left',
          }}
        >
          {error.stack}
        </pre>
        {(error.actions || []).map((action, index) => {
          return (
            <Button
              key={index}
              style={{
                marginRight: 16,
              }}
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
        <div>
          <br />
          <br />
          <h2>测试按钮</h2>
          <br />
          <Button onClick={this.handleInstallDeps} loading={actionLoading} type="primary">
            {actionLoading ? '依赖安装中...' : '在 /private/tmp/foooo 下安装依赖'}
          </Button>
          <Button
            onClick={async () => {
              await callRemote({
                type: '@@actions/reInstallDependencies',
                payload: {
                  npmClient: 'yarn',
                  projectPath: '/private/tmp/foooo',
                },
                onProgress(data) {
                  console.log(`Reinstall: ${data.install}`);
                },
              });
            }}
          >
            重新安装依赖
          </Button>
          <Button
            onClick={async () => {
              await callRemote({
                type: '@@actions/openConfigFile',
                payload: {
                  projectPath: '/private/tmp/foooo',
                },
              });
            }}
          >
            打开配置文件
          </Button>
          <Button onClick={async () => {}}>..</Button>
        </div>
      </div>
    ) : null;

    return (
      <Layout type="loading">
        <div className={styles.loading}>
          {error ? (
            <Fail title="加载失败" subTitle={error.message || ''} extra={actionsDeps} />
          ) : (
            <Fragment>
              <div className={styles['loading-spin']}>
                <Spin size="large" />
                <p>{messages['org.umi.ui.loading.open']}</p>
              </div>
            </Fragment>
          )}
        </div>
      </Layout>
    );
  }
}
