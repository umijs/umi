import React from 'react';
import { Steps, Icon } from 'antd';
import p from 'immer';
import ProjectContext from '@/layouts/ProjectContext';
import StepForm from '@/components/StepForm';
import { APP_LANGUAGE, APP_TYPE, ICreateProgress } from '@/enums';
import { IProjectProps } from '../index';
import Form1 from './Form1';
import Form2 from './Form2';
import { createProject } from '@/services/project';

import common from '../common.less';

const { useState, useContext } = React;
const { Step } = Steps;

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

export interface ICreaetProjectValue {
  baseDir: string;
  name: string;
  type: APP_TYPE;
  args: {
    // temp, will fix create-umi
    isTypeScript?: boolean;
    language: APP_LANGUAGE;
    reactFeatures?: string[];
  };
  npmClient: string;
}

const CreateProject: React.SFC<IProjectProps> = props => {
  const { cwd } = props;
  const [progress, setProgress] = useState<ICreateProgress>();
  const { formatMessage } = useContext(ProjectContext);

  const handleSubmit = async (values: ICreaetProjectValue) => {
    try {
      console.log('values', values);
      const params = p(values, draft => {
        // temp compatible with create-umi
        draft.args.isTypeScript = draft.args.language === 'TypeScript';
      });
      await createProject(params, {
        onProgress: async (res: ICreateProgress) => {
          console.log('progress2', res);
          setProgress(res);
        },
      });
      setProgress(curr => {
        return {
          ...curr,
          success: true,
        };
      });
    } catch (e) {
      setProgress(curr => {
        return {
          ...curr,
          failure: e,
        };
      });
    }
  };
  console.log('progressprogressprogress', progress);

  const getStepStatus = (progress: ICreateProgress): 'error' | 'finish' => {
    if (progress.success) {
      return 'finish';
    }
    if (progress.failure) {
      return 'error';
    }
  };

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
      {!progress ? (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
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
        </div>
      ) : (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {Array.isArray(progress.steps) && progress.steps.length > 0 && (
            <Steps
              current={progress.success ? 4 : progress.step - 1}
              status={getStepStatus(progress)}
            >
              {progress.steps.concat(['创建成功']).map((step, i) => {
                return (
                  <Step
                    key={i.toString()}
                    title={step}
                    icon={
                      progress.stepStatus === 1 &&
                      progress.step === i + 1 && <Icon type="loading" />
                    }
                  />
                );
              })}
            </Steps>
            // <div>
            //   步骤为 {progress.steps[progress.step]}，状态为 {progress.stepStatus}
            // </div>
          )}
          {progress.success ? <div>创建成功</div> : null}
          {progress.failure ? <div>创建失败：{progress.failure.message}</div> : null}
        </div>
      )}
    </section>
  );
};

export default CreateProject;
