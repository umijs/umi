/**
 * 添加模板的表单，选择路径和文件夹
 */
import React, { useContext } from 'react';
import { Form } from 'antd';

import Context from '../UIApiContext';
import RoutePathTree from './RoutePathTree';
import PageFoldersTreeData from './PageFoldersTreeData';
import InfoToolTip from './InfoToolTip';

const AddBlockForm: React.FC<{
  blockType: string;
  visible: boolean;
}> = ({ visible }) => {
  const { api } = useContext(Context);
  return (
    <>
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
              const { exists } = (await api.callRemote({
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
        <RoutePathTree visible={visible} />
      </Form.Item>
      <Form.Item
        name="path"
        label={
          <InfoToolTip
            title="添加到"
            placeholder="表示相对于 src/pages 的文件路径，区块的源码将放在这个地方"
          />
        }
        rules={[
          { required: true, message: '添加路径为必填项！' },
          {
            validator: async (rule, filePath) => {
              if (filePath === '/') {
                throw new Error('安装文件夹不能为根目录！');
              }
              const { exists } = (await api.callRemote({
                type: 'org.umi.block.checkExistFilePath',
                payload: {
                  path: filePath,
                },
              })) as {
                exists: boolean;
              };
              if (exists) {
                throw new Error('安装文件路径已存在文件！');
              }
            },
          },
        ]}
      >
        <PageFoldersTreeData visible={visible} />
      </Form.Item>
    </>
  );
};

export default AddBlockForm;
