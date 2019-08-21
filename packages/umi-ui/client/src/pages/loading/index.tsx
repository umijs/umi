import React, { Fragment } from 'react';
import { Spin, Button } from 'antd';
import { callRemote } from '@/socket';
import Layout from '@/layouts/Layout';
import get from 'lodash/get';
import { getLocale } from 'umi-plugin-react/locale';
import history from '@tmp/history';
import { Terminal as XTerminal } from 'xterm';
import Terminal from '@/components/Terminal';
import actions from './actions';
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
  isClear?: boolean;
}

export default class Loading extends React.Component<ILoadingProps, ILoadingState> {
  logs = '';
  private xterm: XTerminal;
  state = {
    actionLoading: false,
    isClear: false,
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

  handleSuccess = () => {
    console.log('success');
  };

  handleInstallProgress = (data: object) => {
    if (!this.state.isClear) {
      this.setState({
        isClear: true,
      });
      this.logs = '';
      this.xterm.clear();
    }
    console.log('handleInstallProgress data', data);
    this.logs = `${this.logs}\n${data && data.install ? data.install : ''}`;
    this.logs.split('\n').forEach((msg: string) => {
      if (!msg) {
        return;
      }
      this.xterm.writeln(msg);
    });
  };

  render() {
    const locale = getLocale();
    const { error } = this.props;
    console.log('loading this.props', this.props);

    const { actionLoading } = this.state;
    const messages = locales[locale] || locales['zh-CN'];

    const actionsDeps = error ? (
      <div>
        <div
          style={{
            maxWidth: 650,
            textAlign: 'left',
          }}
        >
          <Terminal
            getIns={t => {
              this.xterm = t;
            }}
            defaultValue={error.stack}
          />
        </div>
        {(error.actions || []).map((action, index) => {
          const actionType = get(action, 'handler.type');
          const actionPayload = get(action, 'handler.payload');
          const Action = actions[actionType];
          if (!Action) {
            return null;
          }
          return (
            <Action
              key={index}
              payload={actionPayload}
              onSuccess={this.handleSuccess}
              onProgress={this.handleInstallProgress}
            />
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
