import React, { useState } from 'react';
import { IUiApi } from 'umi-types';
import { Modal, Button, Input, Switch, Form } from 'antd';

import getInsertPosition from './getInsertPosition';
// antd 4.0 not support TreeSelect now.
import TreeSelect from '../TreeSelect';
import useCallData from '../hooks/useCallData';
import { AddBlockParams, Block, Resource } from '../../../data.d';

interface Props {
  onAdded: (params: AddBlockParams) => void;
  block: Block;
  api: IUiApi;
  blockType: Resource['blockType'];
}

const Adder: React.FC<Props> = props => {
  const { onAdded, block, children, blockType, api } = props;
  const { callRemote } = api;

  const [form] = Form.useForm();
  const [visible, setVisible] = useState<boolean>(false);

  const initialValues = {
    path: '/',
    routePath: '/',
    name: block.url.split('/').pop(),
    transformJS: false,
    removeLocale: false,
  };

  // TODO check exists
  // let path = defaultPath;
  // const { exists } = await callRemote({
  //   type: 'org.umi.block.checkexist',
  //   payload: {
  //     path,
  //   },
  // });

  // block 存在时加数字后缀找一个不存在的
  // if (exists) {
  //   let count = 2;
  //   while (true) {
  //     const { exists } = await callRemote({
  //       type: 'org.umi.block.checkexist',
  //       payload: {
  //         path: `${path}-${count}`,
  //       },
  //     });
  //     if (exists) {
  //       count += 1;
  //     } else {
  //       path = `${path}-${count}`;
  //       break;
  //     }
  //   }
  // }

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

  const concatPath = (base, name) => {
    if (base === '/') {
      return `/${name}`;
    }
    return `${base}/${name};`;
  };

  const getPathFromFilename = filename => {
    console.log('filename', filename);
    // /Users/usename/code/test/umi-block-test/src/page(s)/xxx/index.ts
    // -> /xxx
    const path = filename
      .replace(api.currentProject.path, '')
      .replace(/pages?\//, '')
      .replace(/(index)?((\.ts?)|(\.jsx?))$/, '');
    console.log(path);
    return path;
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          if (api.isMini() && blockType === 'block') {
            getInsertPosition(api).then(position => {
              onAdded({
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
      {visible && (
        <Modal
          title="添加区块"
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
          onOk={() => {
            form.validateFields().then((values: any) => {
              onAdded({
                url: block.url,
                name: blockType === 'block' ? values.name : undefined,
                path: blockType === 'block' ? values.path : concatPath(values.path, values.name),
                routePath:
                  blockType === 'template'
                    ? concatPath(values.routePath, values.name.toLocaleLowerCase())
                    : undefined,
                isPage: false,
              });
            });
          }}
        >
          <Form hideRequiredMark initialValues={initialValues} layout="vertical" form={form}>
            <Form.Item
              name="routePath"
              label="选择路由"
              rules={[{ required: true, message: '路由必选' }]}
            >
              <TreeSelect placeholder="请选择路由" selectable treeData={routePathTreeData} />
            </Form.Item>
            <Form.Item
              name="path"
              label="选择安装路径"
              rules={[{ required: true, message: '安装路径必选' }]}
            >
              <TreeSelect placeholder="请选择安装路径" selectable treeData={pageFoldersTreeData} />
            </Form.Item>
            <Form.Item name="name" label="名称" rules={[{ required: true, message: '名称必填' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="transformJS" label="编译为 JS">
              <Switch />
            </Form.Item>
            <Form.Item name="removeLocale" label="移除国际化">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default Adder;
