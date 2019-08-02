import React from 'react';
import { Button } from 'antd';
import { callRemote, listenRemote } from '@/socket';
import cls from 'classnames';

import styles from './index.less';

const { useState, useEffect } = React;

interface CreateProjectProps {}

const CreateProject: React.SFC<CreateProjectProps> = props => {
  const { fetchProject } = props;
  const [progress, setProgress] = useState({});
  const createProject = async () => {
    try {
      await callRemote({
        type: '@@project/create',
        payload: {
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
        onProgress: async progress => {
          setProgress(progress);
          await fetchProject();
        },
      });
      setProgress({
        success: true,
      });
    } catch (e) {
      setProgress({
        failure: e,
      });
    }
  };

  return (
    <section>
      <h2>创建项目</h2>
      <Button type="primary" onClick={createProject}>
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
