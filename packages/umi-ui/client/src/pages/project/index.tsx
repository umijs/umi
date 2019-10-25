import React, { useEffect, useState, useContext } from 'react';
import { Layout, message } from 'antd';
import isPlainObject from 'lodash/isPlainObject';
import ProjectContext from '@/layouts/ProjectContext';
import { IProjectList } from '@/enums';
import debug from '@/debug';
import { fetchProject, getCwd, listDirectory } from '@/services/project';
import * as projectMap from './components';
import styles from './index.less';

const { Content } = Layout;

const Project: React.FC<{}> = () => {
  const _log = debug.extend('Project');
  const [data, setData] = useState<IProjectList>({});
  const [cwd, setCwd] = useState();
  const [files, setFiles] = useState([]);

  const { current, currentData, basicUI } = useContext(ProjectContext);

  async function getProject() {
    const { data } = await fetchProject({
      onProgress: async res => {
        // listen change
        _log('listen projects', res);
        setData(res);
      },
    });
    setData(data);
  }

  const getComponentProps = curr => {
    let projectProps = {};
    switch (current) {
      case 'list':
        projectProps = {
          projectList: data,
        };
        break;
      case 'create':
        projectProps = {
          cwd,
        };
        break;
      case 'import':
        projectProps = {
          cwd,
          files,
        };
        break;
      case 'progress':
        projectProps = {
          currentData,
          projectList: data,
        };
        break;
      default:
        projectProps = {
          currentData,
          projectList: data,
          cwd,
          files,
        };
        break;
    }
    return projectProps;
  };

  useEffect(() => {
    (async () => {
      await getProject();
      const { cwd } = await getCwd();
      setCwd(cwd);
      try {
        const { data: files } = await listDirectory({
          dirPath: cwd,
        });
        setFiles(files);
      } catch (e) {
        message.error(e && e.message ? e.message : '目录选择错误');
      }
    })();
  }, []);
  const extendProjectPage = basicUI.get('project.pages');
  const mergedProjectMap = isPlainObject(extendProjectPage)
    ? Object.assign({}, projectMap, extendProjectPage)
    : projectMap;
  const ProjectComp = mergedProjectMap[current];
  const projectProps = getComponentProps(current);

  return (
    <Layout className={styles.project}>
      <Content className={styles['project-content']}>
        <ProjectComp key={current} {...projectProps} />
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

export default Project;
