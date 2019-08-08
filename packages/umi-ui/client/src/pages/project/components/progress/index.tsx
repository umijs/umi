import * as React from 'react';
import cls from 'classnames';
import { Steps, Icon } from 'antd';
import get from 'lodash/get';
import { ICreateProgress } from '@/enums';
import ProjectContext from '@/layouts/ProjectContext';
import { setCurrentProject } from '@/services/project';
import styles from './index.less';
import { IProjectProps } from '../index';

const { useContext } = React;

const { Step } = Steps;

const ProgressStage: React.SFC<IProjectProps> = props => {
  console.log('ProgressStage props', props);
  const { currentData, projectList } = props;
  const { openLog } = useContext(ProjectContext);
  const key = get(currentData, 'key');
  const progress: ICreateProgress =
    get(projectList, `projectsByKey.${get(currentData, 'key')}.creatingProgress`) || {};
  console.log('progressprogressprogress', progress);
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
      return (
        <p>
          项目创建成功，<a onClick={() => key && setCurrentProject({ key })}>点击进入</a>
        </p>
      );
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
                icon={progress.stepStatus === 1 && progress.step === i && <Icon type="loading" />}
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
          <a onClick={() => openLog()}>查看日志</a>
        </div>
      )}
    </div>
  );
};

export default ProgressStage;
