import React, { useState, useContext } from 'react';
import { IUiApi } from 'umi-types';
import { Modal, Button, Switch, Tooltip, Form, message, Input } from 'antd';
import { QuestionCircle } from '@ant-design/icons';
import upperCamelCase from 'uppercamelcase';

import getInsertPosition from './getInsertPosition';
import Context from '../UIApiContext';
// antd 4.0 not support TreeSelect now.
import TreeSelect from '../TreeSelect';
import useCallData from '../hooks/useCallData';
import { AddBlockParams, Block, Resource } from '../../../data.d';
import LogPanel from '../LogPanel';

interface AdderProps {
  onAddSuccess?: (params: AddBlockParams) => void;
  onAddClick?: (params: AddBlockParams) => void;
  block: Block;
  api: IUiApi;
  blockType: Resource['blockType'];
}

const InfoToolTip: React.FC<{ title: string; placeholder: string }> = ({ title, placeholder }) => (
  <Tooltip title={placeholder}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {title}
      <QuestionCircle
        style={{
          marginLeft: 8,
        }}
      />
    </div>
  </Tooltip>
);

const addBlock = async (api: IUiApi, params: AddBlockParams) => {
  const { data: info = { message: '' } } = (await api.callRemote({
    type: 'org.umi.block.add',
    payload: params,
  })) as {
    data: {
      message: string;
      logs: string[];
    };
  };
  return info.message;
};

const renderOkText = (addStatus: 'form' | 'log', loading: boolean) => {
  if (addStatus === 'log' && !loading) {
    return '完成';
  }
  if (addStatus === 'log') {
    return '停止';
  }
  return '确认';
};

const Adder: React.FC<AdderProps> = props => {
  const { onAddSuccess, onAddClick, block, children, blockType } = props;
  const { api } = useContext(Context);
  const { callRemote } = api;

  const [form] = Form.useForm();
  // 窗口展示
  const [visible, setVisible] = useState<boolean>(false);
  // 是不是正在安装区块
  const [loading, setLoading] = useState<boolean>(false);

  // 展示哪个界面
  // log 日志  form 表单
  const [addStatus, setAddStatus] = useState<'form' | 'log'>('form');

  // 区块添加的目标文件夹
  // 用来判断是区块目标目录是否冲突
  const [blockTarget, setBlockTarget] = useState<string>();

  // 生成 defaultName
  const defaultName = block.url.split('/').pop();

  // 如果不是 min 或者 是区块，就显示路由配置
  const needRouterConfig = !api.isMini() || blockType === 'template';
  /**
   * 默认值，自动拼接一下 name
   */
  const initialValues = {
    path: `/${defaultName}`,
    routePath: `/${defaultName}`,
    name: upperCamelCase(defaultName),
    transformJS: false,
    removeLocale: false,
  };

  const { data: routePathTreeData } = useCallData(
    () =>
      callRemote({
        type: 'org.umi.block.routes',
      }) as any,
    [],
    {
      defaultData: [],
    },
  );

  const { data: pageFoldersTreeData } = useCallData(
    () =>
      callRemote({
        type: 'org.umi.block.pageFolders',
      }) as any,
    [],
    {
      defaultData: [],
    },
  );

  const getPathFromFilename = filename => {
    // TODO get PagesPath from server add test case
    // /Users/userName/code/test/umi-block-test/src/page(s)/xxx/index.ts
    // or /Users/userName/code/test/umi-pro/src/page(s)/xxx.js
    // -> /xxx
    const path = filename
      .replace(api.currentProject.path, '')
      .replace(/(src\/)?pages?\//, '')
      .replace(/(index)?((\.tsx?)|(\.jsx?))$/, '');
    return path;
  };
  const getBlockTargetFromFilename = filename => {
    // TODO 更优雅的实现
    const path = filename
      .replace(api.currentProject.path, '')
      .replace(/(src\/)?pages?\//, '')
      .replace(/\/[^/]+((\.tsx?)|(\.jsx?))$/, '');
    return path;
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          if (api.isMini() && blockType === 'block') {
            getInsertPosition(api)
              .then(position => {
                const targetPath = getPathFromFilename(position.filename);
                form.setFieldsValue({
                  path: targetPath,
                  index: position.index,
                });
                setBlockTarget(getBlockTargetFromFilename(position.filename));
                setVisible(true);
              })
              .catch(e => {
                message.error(e.message);
              });
          } else {
            setVisible(true);
          }
        }}
      >
        {children}
      </Button>
      <Modal
        title="添加"
        visible={visible}
        destroyOnClose
        onCancel={() => {
          setVisible(false);
          if (!loading) {
            setAddStatus('form');
          }
        }}
        okText={renderOkText(addStatus, loading)}
        onOk={() => {
          if (addStatus === 'log' && !loading) {
            setVisible(false);
            setAddStatus('form');
            return;
          }
          if (addStatus === 'log') {
            Modal.confirm({
              title: '停止安装',
              content: '确定要停止安装区块吗？',
              okType: 'danger',
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                console.log('run stop add');
              },
            });
            return;
          }
          form.validateFields().then(async (values: any) => {
            setLoading(true);
            setAddStatus('log');
            const params: AddBlockParams = {
              url: block.url,
              path: blockType === 'block' ? values.path : values.path,
              routePath: blockType === 'template' ? values.routePath : undefined,
              isPage: false,
              index: parseInt(values.index || '0', 0),
              name: values.name,
            };
            onAddClick(params);
            try {
              const info = await addBlock(api, params);
              message.success(info);
            } catch (error) {
              message.error(error.message);
            }
            setLoading(false);
            onAddSuccess(params);
          });
        }}
      >
        <Form
          hideRequiredMark
          initialValues={initialValues}
          layout="vertical"
          form={form}
          style={{
            display: addStatus !== 'form' && 'none',
          }}
        >
          {needRouterConfig && (
            <Form.Item
              name="routePath"
              label={
                <InfoToolTip
                  title="路由路径"
                  placeholder="路由路径代表你通过 url 访问到这个页面的路径，会写入 config.ts 中。"
                />
              }
              rules={[
                { required: true, message: '路由必选' },
                {
                  validator: async (rule, value) => {
                    if (value === '/') {
                      return;
                    }
                    const { exists } = (await callRemote({
                      type: 'org.umi.block.checkExistRoute',
                      payload: {
                        path: value.toLowerCase(),
                      },
                    })) as {
                      exists: boolean;
                    };
                    if (exists) {
                      throw new Error('路由路径已存在');
                    }
                  },
                },
              ]}
            >
              <TreeSelect
                placeholder="请选择路由"
                filterPlaceholder="筛选路由"
                selectable
                treeData={routePathTreeData}
              />
            </Form.Item>
          )}
          {api.isMini() ? (
            <Form.Item
              name="path"
              label="安装路径"
              rules={[{ required: true, message: '安装路径必选' }]}
            >
              <Input disabled />
            </Form.Item>
          ) : (
            <Form.Item
              name="path"
              label={
                <InfoToolTip
                  title="安装路径"
                  placeholder="安装路径代表相对于 src/pages 的文件路径，区块的源码将放在这个地方"
                />
              }
              rules={[
                { required: true, message: '安装路径必选' },
                {
                  validator: async (rule, path) => {
                    if (path === '/') {
                      throw new Error('安装文件夹不能为根目录');
                    }
                    const { exists } = (await callRemote({
                      type: 'org.umi.block.checkExistFilePath',
                      payload: {
                        path,
                      },
                    })) as {
                      exists: boolean;
                    };
                    if (exists) {
                      throw new Error('文件路径已存在');
                    }
                  },
                },
              ]}
            >
              <TreeSelect
                placeholder="请选择安装路径"
                filterPlaceholder="筛选安装路径"
                selectable
                treeData={pageFoldersTreeData}
              />
            </Form.Item>
          )}
          {api.isMini() && blockType === 'block' && (
            <Form.Item
              name="name"
              label="请输入名称"
              rules={[
                { required: true, message: '名称必填' },
                {
                  validator: async (rule, name) => {
                    const { exists } = (await callRemote({
                      type: 'org.umi.block.checkExistFilePath',
                      payload: {
                        path: `${blockTarget}/${name}`,
                      },
                    })) as {
                      exists: boolean;
                    };
                    if (exists) {
                      throw new Error('目标路径已存在');
                    }
                  },
                },
              ]}
            >
              <Input placeholder="请输入名称" />
            </Form.Item>
          )}
          <Form.Item name="transformJS" label="编译为 JS">
            <Switch />
          </Form.Item>
          <Form.Item name="removeLocale" label="移除国际化">
            <Switch />
          </Form.Item>
          <Form.Item name="index">
            <input type="hidden" />
          </Form.Item>
        </Form>
        {addStatus === 'log' && <LogPanel loading={loading} />}
      </Modal>
    </>
  );
};

export default Adder;
