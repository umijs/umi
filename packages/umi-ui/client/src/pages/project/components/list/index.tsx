import * as React from 'react';
import { Button, List, Skeleton, Badge, Spin, Popconfirm, Row, Col, message, Layout } from 'antd';
import { router } from 'umi';
import {
  fetchProject,
  setCurrentProject,
  openProjectInEditor,
  editProject,
  deleteProject,
} from '@/services/project';
import ProjectContext from '@/layouts/ProjectContext';
import ModalForm from './ModalForm';

import styles from './index.less';

const { Sider, Content } = Layout;
const { useState, useEffect, useContext, useMemo } = React;

type IAction = 'editor' | 'open' | 'edit' | 'delete';

interface ProjectListProps {}

const ProjectList: React.SFC<ProjectListProps> = props => {
  const { currentProject } = props;
  const { setCurrent, current } = useContext(ProjectContext);
  const [initialValues, setInitiaValues] = useState({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [data, setData] = useState({});

  const ProjectStatus = props => {
    if (props.item.creatingProgress) {
      return <Spin />;
    }
    if (props.item.key === currentProject) {
      return <Badge status="success" />;
    }
    return null;
  };

  const getProjects = async () => {
    const { data } = await fetchProject();
    setData(data);
  };

  useEffect(() => {
    getProjects();
  }, []);

  const projects = useMemo(
    () => {
      const { projectsByKey = {}, currentProject } = data;
      return Object.keys(projectsByKey).map(key => {
        return {
          ...projectsByKey[key],
          key,
        };
      });
    },
    [data],
  );

  const handleOnAction = async (action: IAction, payload: { key?: string; [key: string]: any }) => {
    if (action === 'open') {
      await setCurrentProject(payload);
      router.push('/dashboard');
      document.getElementById('root').innerHTML = '正在跳转到项目页...';
      window.location.reload();
    }
    if (action === 'delete') {
      await deleteProject(payload);
      message.success('删除成功');
      getProjects();
    }
    if (action === 'editor') {
      await openProjectInEditor(payload);
    }
    if (action === 'edit') {
      setModalVisible(true);
      setInitiaValues(payload);
    }
  };

  return (
    <Layout className={styles['project-list-layout']}>
      <Sider>Sider</Sider>
      <Content>
        <Row type="flex" justify="space-between">
          <Col>
            <h2 className={styles['project-title']}>项目列表</h2>
          </Col>
          <Col>
            <div className={styles['project-action']}>
              <Button onClick={() => setCurrent('import')}>导入项目</Button>
              <Button type="primary" onClick={() => setCurrent('create')}>
                创建项目
              </Button>
            </div>
          </Col>
        </Row>

        <List
          className={styles['project-list']}
          dataSource={projects}
          renderItem={item => (
            <List.Item
              className={styles['project-list-item']}
              actions={[
                <a onClick={() => handleOnAction('editor', { key: item.key })}>在编辑器中打开</a>,
                <a onClick={() => handleOnAction('open', { key: item.key })}>打开</a>,
                <a onClick={() => handleOnAction('edit', { key: item.key, name: item.name })}>
                  重命名
                </a>,
                <Popconfirm
                  title="是否删除项目？"
                  onConfirm={() => handleOnAction('delete', { key: item.key })}
                  onCancel={() => {}}
                  okText="是"
                  cancelText="否"
                >
                  <a>删除</a>
                </Popconfirm>,
              ]}
            >
              <Skeleton title={false} loading={item.loading} active>
                <List.Item.Meta
                  title={
                    <p className={styles['project-list-item-title']}>
                      <ProjectStatus item={item} />
                      {item.name}
                    </p>
                  }
                  description={item.path}
                />
              </Skeleton>
            </List.Item>
          )}
        />
      </Content>
      {modalVisible && (
        <ModalForm
          onCancel={() => setModalVisible(false)}
          initialValues={initialValues}
          onOk={async (formKey, payload) => {
            setModalVisible(false);
            await editProject(payload);
            message.success('修改成功');
            getProjects();
          }}
        />
      )}
    </Layout>
  );
};

export default ProjectList;
