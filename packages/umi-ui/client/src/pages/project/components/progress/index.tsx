import * as React from 'react';
import { Loading } from '@ant-design/icons';
import { Steps, Button, message } from 'antd';
import get from 'lodash/get';
import { Beforeunload } from 'react-beforeunload';
import { ICreateProgress } from '@/enums';
import ProjectContext from '@/layouts/ProjectContext';
import Terminal, { TerminalType } from '@/components/Terminal';
import debug from '@/debug';
import LoadingPage from '@/components/Loading';
import { listenCreateProject, setCurrentProject, createProject } from '@/services/project';
import { handleBack } from '@/utils';
import styles from './index.less';
import { IProjectProps } from '../index';

const { useContext, useEffect, useState } = React;

const { Step } = Steps;

const ProgressStage: React.FC<IProjectProps> = props => {
  const _log = debug.extend('ProgressStage');
  _log('ProgressStage props', props);
  let terminal: TerminalType;
  const { currentData, projectList } = props;
  const { formatMessage, locale } = useContext(ProjectContext);
  const [retryLoading, setRetryLoading] = useState<boolean>(false);
  const key = get(currentData, 'key');
  const progress: ICreateProgress =
    get(projectList, `projectsByKey.${get(currentData, 'key')}.creatingProgress`) || {};
  _log('progress', progress);
  useEffect(
    () => {
      if (progress.success && key) {
        (async () => {
          await setCurrentProject({ key });
          await handleBack(true, '/dashboard');
          // for flash dashboard
          document.getElementById('root').innerHTML = '';
          ReactDOM.render(
            React.createElement(<LoadingPage />, {}),
            document.getElementById('root'),
          );
        })();
      }
      if (progress.failure) {
        const { code: errorCode, message: errorMsg, path: errorPath } = progress.failure;
        let msg = '';
        if (progress.failure.code === 'EACCES') {
          msg = formatMessage(
            {
              id: 'org.umi.ui.global.project.create.steps.EACCES',
            },
            {
              path: errorPath,
              code: errorCode,
            },
          );
        } else {
          msg = errorMsg;
        }
        if (terminal) {
          terminal.write(msg.replace(/\n/g, '\r\n'));
        }
      }

      const unsubscribe = listenCreateProject({
        onMessage: data => {
          _log('listen createProject', data);
          if (data.install && terminal) {
            terminal.write(data.install.replace(/\n/g, '\r\n'));
          }
        },
      });
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    },
    [progress.success, progress.failure],
  );
  const getStepStatus = (): 'error' | 'finish' => {
    if (progress.success) {
      return 'finish';
    }
    if (progress.failure && !retryLoading) {
      return 'error';
    }
  };

  const getTitle = () => {
    if (progress.success) {
      return <p>{formatMessage({ id: 'org.umi.ui.global.progress.create.success' })}</p>;
    }
    if (progress.failure) {
      return formatMessage({ id: 'org.umi.ui.global.progress.create.failure' });
    }
    return formatMessage({ id: 'org.umi.ui.global.progress.create.loading' });
  };

  const steps = progress.steps ? progress.steps[locale] : [];

  const progressSteps = Array.isArray(steps)
    ? steps.concat([formatMessage({ id: 'org.umi.ui.global.progress.create.success' })])
    : [];

  const handleRetry = async () => {
    setRetryLoading(true);
    try {
      const data = await createProject({
        key,
        retryFrom: progress.step,
      });
      _log('handleRetry', data);
    } catch (e) {
      message.error(
        e && e.message
          ? e.message
          : formatMessage({ id: 'org.umi.ui.global.progress.retry.failure' }),
      );
    } finally {
      setRetryLoading(false);
    }
  };

  const status = getStepStatus();
  _log('status', status);
  _log('progressSteps', progressSteps);
  return (
    <Beforeunload onBeforeunload={() => 'You will lose data'}>
      <div className={styles['project-progress']}>
        <h3>{getTitle()}</h3>
        {progress && (
          <Steps
            current={progress.success ? progressSteps.length - 1 : progress.step}
            status={status}
            labelPlacement="vertical"
          >
            {progressSteps.map((step, i) => {
              return (
                <Step
                  key={i.toString()}
                  title={step}
                  icon={progress.stepStatus === 1 && progress.step === i && <Loading />}
                />
              );
            })}
          </Steps>
        )}
        {/* {progress.success ? <div>创建成功</div> : null} */}
        <div style={{ marginTop: 16 }}>
          <Terminal
            terminalClassName={styles.terminal}
            onInit={ins => {
              terminal = ins;
            }}
          />
        </div>
        {progress.failure && (
          <div className={styles['project-progress-fail']}>
            <Button loading={retryLoading} type="primary" onClick={handleRetry}>
              {formatMessage({ id: 'org.umi.ui.global.progress.retry' })}
            </Button>
          </div>
        )}
      </div>
    </Beforeunload>
  );
};

export default ProgressStage;
