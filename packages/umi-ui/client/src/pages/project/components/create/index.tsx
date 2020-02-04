import React from 'react';
import p from 'immer';
import ProjectContext from '@/layouts/ProjectContext';
import StepForm from '@/components/StepForm';
import { message } from 'antd';
import cls from 'classnames';
import { APP_LANGUAGE, APP_TYPE } from '@/enums';
import debug from '@/debug';
import { IProjectProps } from '../index';
import Form1 from './Form1';
import Form2 from './Form2';
import { createProject } from '@/services/project';

import common from '../common.less';

const { useContext } = React;

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
  const _log = debug.extend('CreateProject');
  const { cwd } = props;
  const { formatMessage, setCurrent, current } = useContext(ProjectContext);

  const handleSubmit = async (values: ICreaetProjectValue) => {
    const params = p(values, draft => {
      // temp compatible with create-umi
      draft.args.isTypeScript = draft.args.language === 'TypeScript';
    });
    _log('params', params);
    try {
      const data = await createProject(params);
      _log('project have create', data);
      if (data && data.key) {
        setCurrent('progress', data);
      } else {
        message.error('未知错误');
      }
    } catch (e) {
      message.error(e && e.message ? e.message : '未知错误');
    }
  };

  const stepCls = cls(common.steps, common[`steps-${current}`]);

  return (
    <section className={common.section}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <StepForm onFinish={handleSubmit} className={stepCls}>
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
      {/* <Steps current={currentStep}>
        {PROJECT_STEPS.map(step => (
          <Step title={formatMessage({ id: step.title })} />
        ))}
      </Steps> */}
      {/* <Button type="primary" onClick={handleSubmit}>
        在 {cwd} 下创建 hello-umi 项目
      </Button> */}
    </section>
  );
};

export default CreateProject;
