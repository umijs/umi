import React, { useEffect, useReducer, useState, useMemo, useRef } from 'react';
import { Button } from 'antd';
import { router } from 'umi';
import { callRemote, listenRemote } from '@/socket';
import { formatMessage, getLocale, setLocale } from 'umi-plugin-locale';
import styles from './Test.less';

export default () => {
  const [data, setData] = useState({});
  const [progress, setProgress] = useState({});
  const [cwd, setCwd] = useState();
  const [files, setFiles] = useState([]);
  const [logs, dispatch] = useReducer((state, action) => {
    if (action.type === 'add') {
      return [...state, action.payload];
    }
    if (action.type === 'setHistory') {
      return action.payload;
    }
  }, []);

  const pathInput = useRef();
  const nameInput = useRef();
  const locale = getLocale();

  async function fetchProject() {
    const { data } = await callRemote({ type: '@@project/list' });
    setData(data);
  }

  useEffect(() => {
    (async () => {
      await fetchProject();

      const { cwd } = await callRemote({ type: '@@fs/getCwd' });
      setCwd(cwd);

      const { data: files } = await callRemote({
        type: '@@fs/listDirectory',
        payload: {
          dirPath: cwd,
        },
      });
      setFiles(files);

      const { data: historyLogs } = await callRemote({
        type: '@@log/getHistory',
      });
      dispatch({
        type: 'setHistory',
        payload: historyLogs,
      });
      listenRemote({
        type: '@@log/message',
        onMessage(log) {
          dispatch({
            type: 'add',
            payload: log,
          });
        },
      });
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

  async function createProject() {
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
  }

  return (
    <div className={styles.normal}>
      <h1>UmiJS 项目管理器</h1>
      <div>当前语言：{formatMessage({ id: 'hello' })}</div>
      <h2>项目</h2>
      <ul>
        {projects.map(p => {
          return (
            <li key={p.key} className={styles.projectItem}>
              {p.key === currentProject ? <span>[当前打开项目]</span> : null}
              {p.creatingProgress ? <span>[创建中]</span> : null}
              <span>{p.name}</span>
              <Button onClick={openProjectInEditor.bind(null, p.key)}>在编辑器里打开</Button>
              <Button onClick={openProject.bind(null, p.key)}>打开</Button>
              <Button onClick={editProject.bind(null, p.key)}>重命名为 ABC</Button>
              <Button onClick={deleteProject.bind(null, p.key)}>删除</Button>
            </li>
          );
        })}
      </ul>
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
      <h2>日志</h2>
      <ul>
        {logs.map(log => {
          return (
            <li key={log.date}>
              [{log.type}] [{log.date}] {log.message}
            </li>
          );
        })}
      </ul>
      <h2>当前项目</h2>
      <div>{currentProject || '无'}</div>
      <h2>当前路径</h2>
      <div>{cwd || '无'}</div>
      <h2>目录列表</h2>
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
