import { useEffect, useState, useMemo, useRef } from 'react';
import { callRemote } from '@/socket';
import { router } from 'umi';
import styles from './Project.less';

export default () => {
  const [data, setData] = useState({});

  const pathInput = useRef();
  const nameInput = useRef();

  async function fetchProject() {
    const { data } = await callRemote({ type: '@@project/list' });
    setData(data);
  }

  useEffect(() => {
    fetchProject().catch(e => {});
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
    // TODO
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
    </div>
  );
};
