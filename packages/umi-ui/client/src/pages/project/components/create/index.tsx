import React from 'react';
import { Button } from 'antd';
import ProjectContext from '@/layouts/ProjectContext';
import StepForm from '@/components/StepForm';
import { IProjectProps } from '../index';
import Form1 from './Form1';
import Form2 from './Form2';
import { createProject } from '@/services/project';

import common from '../common.less';

const { useState, useContext } = React;

const PROJECT_STEPS = [
  {
    title: 'org.umi.ui.global.project.create.steps.select',
    children: Form1,
  },
  {
    title: 'org.umi.ui.global.project.create.steps.input',
    children: Form2,
  },
];

const CreateProject: React.SFC<IProjectProps> = props => {
  const { cwd } = props;
  const [progress, setProgress] = useState({});
  const { setCurrent, formatMessage } = useContext(ProjectContext);

  const handleSubmit = async values => {
    console.log('values', values);
    // try {
    //   await createProject(
    //     {
    //       npmClient: 'tnpm',
    //       baseDir: cwd,
    //       name: 'hello-umi',
    //       // type: 'ant-design-pro',
    //       // args: {
    //       //   language: 'TypeScript',
    //       // },
    //       type: 'app',
    //       args: {
    //         isTypeScript: true,
    //         reactFeatures: ['antd', 'dva'],
    //       },
    //     },
    //     {
    //       onProgress: async progress => {
    //         setProgress(progress);
    //       },
    //     },
    //   );
    //   setProgress({
    //     success: true,
    //   });
    //   setCurrent('list');
    // } catch (e) {
    //   setProgress({
    //     failure: e,
    //   });
    // }
  };

  console.log('progress', progress);

  return (
    <section className={common.section}>
      {/* <Steps current={currentStep}>
        {PROJECT_STEPS.map(step => (
          <Step title={formatMessage({ id: step.title })} />
        ))}
      </Steps> */}
      {/* <Button type="primary" onClick={handleSubmit}>
        在 {cwd} 下创建 hello-umi 项目
      </Button> */}
      <StepForm onFinish={handleSubmit}>
        {PROJECT_STEPS.map((step, i) => {
          const FormChild = step.children;
          return (
            <StepForm.StepItem key={i.toString()} title={formatMessage({ id: step.title })}>
              <FormChild cwd={cwd} />
            </StepForm.StepItem>
          );
        })}
      </StepForm>

      {/* {currentStep === PROJECT_STEPS.length - 1 &&
            <Button
              type="primary"
              htmlType="submit"
            >
              {formatMessage({ id: '创建项目' })}
            </Button>
          } */}
      {/* {currentStep > 0 &&
            <Button onClick={() => setCurrentStep('prev')}>
              {formatMessage({ id: '上一步' })}
            </Button>
          } */}
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
