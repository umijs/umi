import React, { useRef } from 'react';
import { Button } from 'antd';
import { callRemote, listenRemote } from '@/socket';
import cls from 'classnames';

import styles from './index.less';

const { useState, useEffect } = React;

interface ImportProjectProps {}

const ImportProject: React.SFC<ImportProjectProps> = props => {
  const { currentProject, cwd, files, logs, fetchProject } = props;
  const pathInput = useRef<HTMLInputElement>();
  const nameInput = useRef<HTMLInputElement>();

  async function importProject() {
    try {
      await callRemote({
        type: '@@project/add',
        payload: {
          path: pathInput.current.value,
          name: nameInput.current.value,
        },
      });
      await fetchProject();
    } catch (e) {
      // TODO: handle add failed
    }
  }

  return (
    <section>
      <h2>导入</h2>
      <div>
        Path: <input ref={pathInput} defaultValue="/tmp/hahaha" />
      </div>
      <div>
        Name: <input ref={nameInput} defaultValue="hahaha" />
      </div>
      <Button type="primary" onClick={importProject}>
        Import Project
      </Button>
    </section>
  );
};

export default ImportProject;
