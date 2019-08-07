import React from 'react';
import { Button, Steps } from 'antd';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-locale';
import ProjectContext from '@/layouts/ProjectContext';
import { createProject } from '@/services/project';

import common from '../common.less';

const { useState, useContext } = React;

const { Step } = Steps;

interface CreateProjectProps {}

const CreateProject: React.SFC<CreateProjectProps> = props => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState({});
  const { setCurrent } = useContext(ProjectContext);

  const handleClick = async () => {
    try {
      await createProject(
        {
          npmClient: 'tnpm',
          baseDir: '/private/tmp',
          name: 'hello-umi',
          // type: 'ant-design-pro',
          // args: {
          //   language: 'TypeScript',
          // },
          type: 'app',
          args: {
            isTypeScript: true,
            reactFeatures: ['antd', 'dva'],
          },
        },
        {
          onProgress: async progress => {
            setProgress(progress);
          },
        },
      );
      setProgress({
        success: true,
      });
      setCurrent('list');
    } catch (e) {
      setProgress({
        failure: e,
      });
    }
  };

  console.log('progress', progress);

  return (
    <section className={common.section}>
      <Steps current={currentStep}>
        <Step title={formatMessage({ id: 'org.umi.ui.global.project.create.steps.select' })} />
        <Step title={formatMessage({ id: 'org.umi.ui.global.project.create.steps.input' })} />
      </Steps>
      <Button type="primary" onClick={handleClick}>
        在 /private/tmp 下创建 hello-umi 项目
      </Button>
      {progress.steps ? (
        <div>
          步骤为 {progress.steps[progress.step]}，状态为 {progress.stepStatus}
        </div>
      ) : null}
      {progress.success ? <div>创建成功</div> : null}
      {progress.failure ? <div>创建失败：{progress.failure.message}</div> : null}
    </section>
  );
};

export default CreateProject;
