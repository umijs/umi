import * as React from 'react';
import {
  Button,
  List,
  Skeleton,
  Badge,
  Tag,
  Spin,
  Popconfirm,
  Row,
  Col,
  message,
  Layout,
  Icon,
  Menu,
} from 'antd';
import iconSvg from '@/assets/umi.svg';
import get from 'lodash/get';
import {
  setCurrentProject,
  openProjectInEditor,
  editProject,
  deleteProject,
} from '@/services/project';
import ProjectContext from '@/layouts/ProjectContext';
import ModalForm from './ModalForm';
import { IProjectItem } from '@/enums';
import { IProjectProps } from '../index';

import styles from './index.less';

const { Sider, Content } = Layout;
const { useState, useContext, useMemo } = React;

type IAction = 'editor' | 'open' | 'edit' | 'delete' | 'progress';
interface IProjectListItem extends IProjectItem {
  key: string;
}

const ProjectList: React.SFC<IProjectProps> = props => {
  const { projectList } = props;
  console.log('projectList', projectList);
  const { currentProject, projectsByKey = {} } = projectList;
  const { setCurrent } = useContext(ProjectContext);
  const [initialValues, setInitiaValues] = useState({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const getProjectStatus = (
    item: IProjectListItem,
  ): 'success' | 'failure' | 'progress' | 'active' => {
    if (get(item, 'creatingProgress.success')) return 'success';
    if (get(item, 'creatingProgress.failure')) return 'failure';
    if (item.creatingProgress) return 'progress';
    if (item.key === currentProject) return 'active';
    return 'success';
  };

  const isProgress = (item: IProjectListItem) => {
    if (get(item, 'creatingProgress.success')) return false;
    return !!item.creatingProgress;
  };

  console.log('projectList', projectList);

  const projects = useMemo(
    () => {
      return Object.keys(projectsByKey).map(key => {
        return {
          ...projectsByKey[key],
          key,
        };
      });
    },
    [projectList],
  );

  const handleOnAction = async (action: IAction, payload: { key?: string; [key: string]: any }) => {
    if (action === 'open') {
      await setCurrentProject(payload as any);
    }
    if (action === 'delete') {
      await deleteProject(payload);
      message.success('删除成功');
    }
    if (action === 'editor') {
      await openProjectInEditor(payload);
    }
    if (action === 'edit') {
      setModalVisible(true);
      setInitiaValues(payload);
    }
    // onProgress
    if (action === 'progress') {
      setCurrent('progress', payload);
    }
  };

  const handleTitleClick = async (item: IProjectListItem) => {
    if (isProgress(item)) {
      await handleOnAction('progress', { key: item.key });
    } else {
      await handleOnAction('open', { key: item.key });
    }
  };

  const actionsMap: { [key: string]: (item: IProjectItem) => React.ReactNode[] } = {
    progress: item => [
      <p style={{ cursor: 'auto' }}>
        <Spin style={{ marginRight: 8 }} />
        创建中
      </p>,
    ],
    failure: item => [],
    success: item => [
      <a onClick={() => handleOnAction('editor', { key: item.key })}>
        <Icon type="export" />
        在编辑器中打开
      </a>,
      <a onClick={() => handleOnAction('edit', { key: item.key, name: item.name })}>重命名</a>,
    ],
  };

  return (
    <Layout className={styles['project-list-layout']}>
      <Sider theme="dark" trigger={null} width={72} className={styles['project-list-layout-sider']}>
        <div className={styles['project-list-layout-sider-title']}>
          <img src={iconSvg} alt="UmiUi" />
          <h1>Umi Ui</h1>
        </div>
        <div className={styles['project-list-layout-sider-item']}>
          <Icon theme="filled" type="appstore" />
          <p>项目</p>
        </div>
      </Sider>
      <Content className={styles['project-list-layout-content']}>
        <Row type="flex" justify="space-between" style={{ marginBottom: 26 }}>
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
          dataSource={projects}
          loading={!projects.length}
          split={false}
          className={styles['project-list']}
          renderItem={item => {
            const status = getProjectStatus(item);
            const actions = (actionsMap[status] ? actionsMap[status](item) : []).concat(
              <Popconfirm
                title="是否删除项目？"
                onConfirm={() => handleOnAction('delete', { key: item.key })}
                onCancel={() => {}}
                okText="是"
                cancelText="否"
              >
                <a>删除</a>
              </Popconfirm>,
            );

            return (
              <List.Item className={styles['project-list-item']} actions={actions}>
                <Skeleton title={false} loading={item.loading} active>
                  <List.Item.Meta
                    title={
                      <div className={styles['project-list-item-title']}>
                        {status === 'active' && <Badge status="success" />}
                        <a onClick={() => handleTitleClick(item)}>{item.name}</a>
                        {status === 'progress' && (
                          <Tag className={`${styles.tag} ${styles['tag-progress']}`}>创建中</Tag>
                        )}
                        {status === 'failure' && (
                          <Tag className={`${styles.tag} ${styles['tag-error']}`}>创建失败</Tag>
                        )}
                      </div>
                    }
                    description={item.path}
                  />
                </Skeleton>
              </List.Item>
            );
          }}
        />
      </Content>
      {modalVisible && (
        <ModalForm
          onCancel={() => setModalVisible(false)}
          restModelProps={{
            title: '重命名',
          }}
          initialValues={initialValues}
          onOk={async (formKey, payload) => {
            setModalVisible(false);
            await editProject(payload);
            message.success('修改成功');
          }}
        />
      )}
    </Layout>
  );
};

export default ProjectList;
