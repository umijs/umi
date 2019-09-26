import React, { useState } from 'react';
import { IUiApi } from 'umi-types';
import { Modal, Button, Switch, Form, message } from 'antd';

import getInsertPosition from './getInsertPosition';
// antd 4.0 not support TreeSelect now.
import TreeSelect from '../TreeSelect';
import useCallData from '../hooks/useCallData';
import { AddBlockParams, Block, Resource } from '../../../data.d';
import LogPanel from '../LogPanel';

interface Props {
  onAddSuccess?: (params: AddBlockParams) => void;
  onAddClick?: (params: AddBlockParams) => void;

  block: Block;
  api: IUiApi;
  blockType: Resource['blockType'];
}

const addBlock = async (api: IUiApi, params: AddBlockParams) => {
  const info = await api.callRemote({
    type: 'org.umi.block.add',
    payload: params,
  });
  return info;
};

const Adder: React.FC<Props> = props => {
  const { onAddSuccess, onAddClick, block, children, blockType, api } = props;
  const { callRemote } = api;

  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);
  const [addStatus, setAddStatus] = useState<'form' | 'log'>('form');
  const defaultName = block.url.split('/').pop();

  /**
   * 默认值，自动拼接一下 name
   */
  const initialValues = {
    path: `/${defaultName}`,
    routePath: `/${defaultName}`,
    name: defaultName,
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
    // /Users/userName/code/test/umi-block-test/src/page(s)/xxx/index.ts
    // -> /xxx
    const path = filename
      .replace(api.currentProject.path, '')
      .replace(/pages?\//, '')
      .replace(/(index)?((\.ts?)|(\.jsx?))$/, '');
    return path;
  };
  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          if (api.isMini() && blockType === 'block') {
            getInsertPosition(api).then(position => {
              addBlock(api, {
                url: block.url,
                name: initialValues.name,
                path: getPathFromFilename(position.filename),
                index: position.index,
              });
            });
          } else {
            setVisible(true);
          }
        }}
      >
        {children}
      </Button>
      <Modal
        title="添加区块"
        visible={visible}
        destroyOnClose
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          if (addStatus === 'log') {
            return;
          }
          form.validateFields().then(async (values: any) => {
            setAddStatus('log');
            const params = {
              url: block.url,
              path: blockType === 'block' ? values.path : values.path,
              routePath: blockType === 'template' ? values.routePath : undefined,
              isPage: false,
            };
            onAddClick(params);
            try {
              await addBlock(api, params);
              // setVisible(false);
              message.success('区块安装成功！');
            } catch (error) {
              message.error(error.message);
            }

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
          <Form.Item
            name="routePath"
            label="选择路由"
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
                      path: value,
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
            <TreeSelect placeholder="请选择路由" selectable treeData={routePathTreeData} />
          </Form.Item>
          <Form.Item
            name="path"
            label="选择安装路径"
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
                  console.log(path);
                },
              },
            ]}
          >
            <TreeSelect placeholder="请选择安装路径" selectable treeData={pageFoldersTreeData} />
          </Form.Item>
          {/* <Form.Item
              name="name"
              label="名称"
              rules={[
                { required: true, message: '名称必填' },
              ]}
            >
              <Input />
            </Form.Item> */}
          <Form.Item name="transformJS" label="编译为 JS">
            <Switch />
          </Form.Item>
          <Form.Item name="removeLocale" label="移除国际化">
            <Switch />
          </Form.Item>
        </Form>
        {addStatus === 'log' && <LogPanel api={api} />}
      </Modal>
    </>
  );
};

export default Adder;
