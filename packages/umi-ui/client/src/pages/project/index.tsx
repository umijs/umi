import React, { useEffect, useReducer, useState, useMemo, useRef, useContext } from 'react';
import ProjectContext from '@/layouts/ProjectContext';
import { fetchProject, getCwd, listDirectory } from '@/services/project';
import ProjectMap from './components';
import { getLocale } from 'umi-plugin-locale';
import styles from './index.less';

export default props => {
  const [data, setData] = useState({});
  const [cwd, setCwd] = useState();
  const [files, setFiles] = useState([]);

  const { setCurrent, current } = useContext(ProjectContext);
  const locale = getLocale();

  async function getProject() {
    const { data } = await fetchProject();
    setData(data);
  }

  useEffect(() => {
    (async () => {
      await getProject();

      const { cwd } = await getCwd();
      setCwd(cwd);

      const { data: files } = await listDirectory({
        dirPath: cwd,
      });
      setFiles(files);
    })();
  }, []);

  const { projectsByKey = {}, currentProject } = data;

  const Project = ProjectMap[current];

  return (
    <div className={styles.project}>
      <Project cwd={cwd} files={files} currentProject={currentProject} />
    </div>
  );

  // return (
  //   <div className={styles.project}>

  //     <h2>当前项目</h2>
  //     <div>{currentProject || '无'}</div>
  //     <h2>当前路径</h2>
  //     <div>{cwd || '无'}</div>
  //     <h2>目录列表</h2>
  //     <ul>
  //       {files.map(f => {
  //         return (
  //           <li key={f.fileName}>
  //             [{f.type}] {f.fileName}
  //           </li>
  //         );
  //       })}
  //     </ul>
  //     {/* <ul>
  //       {projects.map(p => {
  //         return (
  //           <li key={p.key} className={styles.projectItem}>
  //             {p.key === currentProject ? <span>[当前打开项目]</span> : null}
  //             {p.creatingProgress ? <span>[创建中]</span> : null}
  //             <span>{p.name}</span>
  //             <Button onClick={openProjectInEditor.bind(null, p.key)}>在编辑器里打开</Button>
  //             <Button onClick={openProject.bind(null, p.key)}>打开</Button>
  //             <Button onClick={editProject.bind(null, p.key)}>重命名为 ABC</Button>
  //             <Button onClick={deleteProject.bind(null, p.key)}>删除</Button>
  //           </li>
  //         );
  //       })}
  //     </ul> */}
  //   </div>
  // );
};
