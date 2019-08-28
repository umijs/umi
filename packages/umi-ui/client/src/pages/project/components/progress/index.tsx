import * as React from 'react';
import { Loading } from '@ant-design/icons';
import { Steps } from 'antd';
import get from 'lodash/get';
import { ICreateProgress } from '@/enums';
import ProjectContext from '@/layouts/ProjectContext';
import { setCurrentProject } from '@/services/project';
import { handleBack } from '@/utils';
import styles from './index.less';
import { IProjectProps } from '../index';

const { useContext, useEffect } = React;

const { Step } = Steps;

const ProgressStage: React.SFC<IProjectProps> = props => {
  console.log('ProgressStage props', props);
  const { currentData, projectList } = props;
  const { showLogPanel } = useContext(ProjectContext);
  const key = get(currentData, 'key');
  const progress: ICreateProgress =
    get(projectList, `projectsByKey.${get(currentData, 'key')}.creatingProgress`) || {};
  console.log('progressprogressprogress', progress);
  useEffect(
    () => {
      if (progress.success && key) {
        (async () => {
          await handleBack(true, '/dashboard');
          await setCurrentProject({ key });
        })();
      }
    },
    [progress.success],
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
      {progress.failure && (
        <div className={styles['project-progress-fail']}>
          <p>{progress.failure.message}</p>
          <a onClick={() => showLogPanel()}>查看日志</a>
        </div>
      )}
    </div>
  );
};

export default ProgressStage;
