/**
 *  在 umi ui 中添加区块
 *  需要选择安装的具体文件位置
 */
import React, { useContext } from 'react';
import { Form, Alert, Input } from 'antd';
import { FormInstance } from 'antd/es/form/util';

import Context from '../UIApiContext';
import InfoToolTip from './InfoToolTip';
import RouteFilesTreeData from './RouteFilesTreeData';
import { getPathFromFilename } from '../BlockList/BlockItem';

const AddBlockFormForUI: React.FC<{
  form: FormInstance;
  visible: boolean;
}> = ({ form, visible }) => {
  const { api } = useContext(Context);
  return (
    <>
      <div
        style={{
          display: 'flex',
          marginBottom: 24,
        }}
      >
        在 min ui 中添加区块，操作更加流畅。
      </div>
      <Form.Item
        name="path"
        label={
          <InfoToolTip
            title="添加到"
            placeholder="此处选择的是 config.js 中的路由，他会根据路由来找到需要添加到的文件！"
          />
        }
        rules={[{ required: true, message: '添加路由为必填项！' }]}
      >
        <RouteFilesTreeData visible={visible} />
      </Form.Item>
      <Form.Item
        name="name"
        label={
          <InfoToolTip
            title="名称"
            placeholder="区块的源代码将会放在 [添加路径]\[名称]的位置，并且将作为变量名加入页面中。"
          />
        }
        rules={[
          { required: true, message: '名称为必填项!' },
          {
            validator: async (rule, name) => {
              const filePath = await getPathFromFilename(api, form.getFieldValue('path'));
              const { exists } = (await api.callRemote({
                type: 'org.umi.block.checkExistFilePath',
                payload: {
                  path: `${filePath}/${name}`,
                },
              })) as {
                exists: boolean;
              };
              if (exists) {
                throw new Error('目标路径已存在文件!');
              }
              const { exists: varExists } = (await api.callRemote({
                type: 'org.umi.block.checkBindingInFile',
                payload: {
                  path: filePath,
                  name,
                },
              })) as { exists: boolean };
              if (varExists) {
                throw new Error('变量已存在于目标页面!');
              }
            },
          },
        ]}
      >
        <Input placeholder="请输入名称！" />
      </Form.Item>
    </>
  );
};

export default AddBlockFormForUI;
