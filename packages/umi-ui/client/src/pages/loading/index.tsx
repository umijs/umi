import React, { Fragment } from 'react';
import { Spin, Button } from 'antd';
import { callRemote } from '@/socket';
import Layout from '@/layouts/Layout';
import get from 'lodash/get';
import { getLocale } from 'umi-plugin-react/locale';
import history from '@tmp/history';
import { Terminal as XTerminal } from 'xterm';
import Terminal from '@/components/Terminal';
import { DINGTALK_MEMBERS } from '@/enums';
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
    window.location.reload();
  };

  handleFailure = () => {
    // TODO if install failed
    console.log('failed');
  };

  handleInstallProgress = (data: object) => {
    if (!this.state.isClear) {
      this.setState({
        isClear: true,
      });
      this.logs = '';
      this.xterm.clear();
    }
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

    console.log('error', error);

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
        <div className={styles['loading-error-action']}>
          {(error.actions || []).map((action, index) => {
            const browserType = get(action, 'browserHandler');
            const handlerType = get(action, 'handler.type');
            const type = browserType || handlerType;
            const actionPayload = get(action, 'handler.payload');
            const Action = actions[type];
            if (!Action) {
              return null;
            }

            return (
              <Action
                key={index}
                type={index % 2 === 0 ? 'primary' : 'default'}
                payload={actionPayload}
                onSuccess={this.handleSuccess}
                onFailure={this.handleFailure}
                onProgress={this.handleInstallProgress}
              >
                {action.title}
              </Action>
            );
          })}
        </div>
      </div>
    ) : null;

    const renderSubTitle = error => (
      <div className={styles['loading-subTitle']}>
        <p>{error.message}</p>
        {error.exception && (
          <div>
            联系{' '}
            {Object.keys(DINGTALK_MEMBERS).map((member: string) => (
              <a target="_blank" href={DINGTALK_MEMBERS[member]}>
                @{member}
              </a>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <Layout type="loading">
        <div className={styles.loading}>
          {error ? (
            <Fail title="加载失败" subTitle={renderSubTitle(error)} extra={actionsDeps} />
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
