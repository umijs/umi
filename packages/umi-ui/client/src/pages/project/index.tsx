import React, { useEffect, useReducer, useState, useMemo, useRef, useContext } from 'react';
import { Layout } from 'antd';
import ProjectContext from '@/layouts/ProjectContext';
import { IProjectList } from '@/enums';
import { fetchProject, getCwd, listDirectory } from '@/services/project';
import * as ProjectMap from './components';
import styles from './index.less';

const { Content } = Layout;

export interface IProjectChildProps {
  cwd: string;
  files: string[];
  projectList: IProjectList;
}

export default props => {
  const [data, setData] = useState<IProjectList>({});
  const [cwd, setCwd] = useState();
  const [files, setFiles] = useState([]);

  const { current } = useContext(ProjectContext);

  async function getProject() {
    const { data } = await fetchProject({
      onProgress: async res => {
        // listen change
        console.log('listen projects', res);
        setData(res);
      },
    });
    setData(data);
  }

  useEffect(() => {
    (async () => {
      await getProject();
      console.log('getProjectgetProjectgetProject');

      const { cwd } = await getCwd();
      setCwd(cwd);

      const { data: files } = await listDirectory({
        dirPath: cwd,
      });
      console.log('cwd', cwd);
      console.log('files', files);
      setFiles(files);
    })();
  }, []);

  const Project = ProjectMap[current];

  return (
    <Layout className={styles.project}>
      <Content className={styles['project-content']}>
        <Project cwd={cwd} files={files} projectList={data} />
      </Content>
    </Layout>
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
