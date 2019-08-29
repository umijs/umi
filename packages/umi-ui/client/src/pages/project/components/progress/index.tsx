import * as React from 'react';
import { Loading } from '@ant-design/icons';
import { Steps, Button } from 'antd';
import get from 'lodash/get';
import { Terminal as XTerminal } from 'xterm';
import { ICreateProgress } from '@/enums';
import ProjectContext from '@/layouts/ProjectContext';
import Terminal from '@/components/Terminal';
import { listenCreateProject, setCurrentProject, createProject } from '@/services/project';
import { handleBack } from '@/utils';
import styles from './index.less';
import { IProjectProps } from '../index';

const { useContext, useEffect, useState } = React;

const { Step } = Steps;

const ProgressStage: React.FC<IProjectProps> = props => {
  const _log = window.g_uiDebug.extend('ProgressStage');
  let xterm: XTerminal = null;
  _log('ProgressStage props', props);
  // const [logs, setLogs] = useState<string>();
  const { currentData, projectList } = props;
  const { showLogPanel } = useContext(ProjectContext);
  const [retryLoading, setRetryLoading] = useState<boolean>(false);
  const key = get(currentData, 'key');
  const progress: ICreateProgress =
    get(projectList, `projectsByKey.${get(currentData, 'key')}.creatingProgress`) || {};
  _log('progress', progress);
  useEffect(
    () => {
      if (progress.success && key) {
        (async () => {
          await handleBack(true, '/dashboard');
          await setCurrentProject({ key });
        })();
      }
      if (progress.failure) {
        if (xterm) {
          xterm.writeln(progress.failure.message.replace(/\n/g, '\r\n'));
        }
      }

      const unsubscribe = listenCreateProject({
        onMessage: data => {
          _log('listen createProject', data);
          if (xterm && data.install) {
            xterm.writeln(data.install.replace(/\n/g, '\r\n'));
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
    if (progress.failure) {
      return 'error';
    }
  };

  const getTitle = () => {
    if (progress.success) {
      return <p>项目创建成功</p>;
    }
    if (progress.failure) {
      return '项目创建失败';
    }
    return '项目创建中，可能会需要几分钟';
  };

  const progressSteps = Array.isArray(progress.steps) ? progress.steps.concat(['创建成功']) : [];

  const handleRetry = async () => {
    const data = await createProject({
      key,
      retryFrom: progress.step,
    });
    _log('handleRetry', data);
  };

  return (
    <div className={styles['project-progress']}>
      <h3>{getTitle()}</h3>
      {progress && (
        <Steps
          current={progress.success ? progressSteps.length - 1 : progress.step}
          status={getStepStatus()}
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
        // <div>
        //   步骤为 {progress.steps[progress.step]}，状态为 {progress.stepStatus}
        // </div>
      )}
      {/* {progress.success ? <div>创建成功</div> : null} */}
      <div style={{ marginTop: 16 }}>
        <Terminal
          getIns={t => {
            xterm = t;
          }}
        />
      </div>
      {progress.failure && (
        <div className={styles['project-progress-fail']}>
          <Button
            loading={retryLoading}
            disabled={retryLoading}
            type="primary"
            onClick={handleRetry}
          >
            重试
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgressStage;
