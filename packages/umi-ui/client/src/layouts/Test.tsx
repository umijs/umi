import React, { useEffect, useState, useMemo, useRef } from 'react';
import { router } from 'umi';
import { callRemote } from '@/socket';
import styles from './Test.less';

export default () => {
  const [data, setData] = useState({});
  const [cwd, setCwd] = useState();
  const [files, setFiles] = useState([]);

  const pathInput = useRef();
  const nameInput = useRef();

  async function fetchProject() {
    const { data } = await callRemote({ type: '@@project/list' });
    setData(data);
  }

  useEffect(() => {
    (async () => {
      await fetchProject();

      const { cwd } = await callRemote({ type: '@@fs/getCwd' });
      setCwd(cwd);

      const { data } = await callRemote({
        type: '@@fs/listDirectory',
        payload: {
          dirPath: cwd,
        },
      });
      setFiles(data);
    })();
  }, []);

  const { projectsByKey = {}, currentProject } = data;
  const projects = useMemo(
    () => {
      return Object.keys(projectsByKey).map(key => {
        return {
          ...projectsByKey[key],
          key,
        };
      });
    },
    [data],
  );

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

  async function openProject(key) {
    try {
      await callRemote({
        type: '@@project/setCurrentProject',
        payload: {
          key,
        },
      });
      router.push('/dashboard');
      document.getElementById('root').innerHTML = '正在跳转到项目页...';
      window.location.reload();
    } catch (e) {
      // TODO: handle add failed
    }
  }

  async function deleteProject(key) {
    try {
      await callRemote({
        type: '@@project/delete',
        payload: {
          key,
        },
      });
      await fetchProject();
    } catch (e) {
      // TODO: handle add failed
    }
  }

  async function openProjectInEditor(key) {
    try {
      await callRemote({
        type: '@@project/openInEditor',
        payload: {
          key,
        },
      });
    } catch (e) {
      // TODO: handle open project in editor failed
    }
  }

  async function editProject(key) {
    try {
      await callRemote({
        type: '@@project/edit',
        payload: {
          key,
          name: 'ABC',
        },
      });
      await fetchProject();
    } catch (e) {
      // TODO: handle edit failed
    }
  }

  return (
    <div className={styles.normal}>
      <h1>UmiJS 项目管理器</h1>
      <h2>项目</h2>
      <ul>
        {projects.map(p => {
          return (
            <li key={p.key} className={styles.projectItem}>
              <span>{p.name}</span>
              <button onClick={openProjectInEditor.bind(null, p.key)}>在编辑器里打开</button>
              <button onClick={openProject.bind(null, p.key)}>打开</button>
              <button onClick={editProject.bind(null, p.key)}>重命名为 ABC</button>
              <button onClick={deleteProject.bind(null, p.key)}>删除</button>
            </li>
          );
        })}
      </ul>
      <h2>导入</h2>
      <div>
        Path: <input ref={pathInput} defaultValue="/tmp/hahaha" />
      </div>
      <div>
        Name: <input ref={nameInput} defaultValue="hahaha" />
      </div>
      <button onClick={importProject}>Import Project</button>
      <h2>当前项目</h2>
      <div>{currentProject || '无'}</div>
      <h2>当前路径</h2>
      <div>{cwd || '无'}</div>
      <h2>文件列表</h2>
      <ul>
        {files.map(f => {
          return (
            <li key={f.fileName}>
              [{f.type}] {f.fileName}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
