/**
 *  在 umi ui 中添加区块
 *  不需要选择安装的具体文件位置
 *  min ui 提供了可视化的方案来选择
 */
import React, { useContext } from 'react';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/es/form/util';

import Context from '../UIApiContext';
import InfoToolTip from './InfoToolTip';

const AddBlockFormForUI: React.FC<{
  blockTarget: string;
  form: FormInstance;
}> = ({ blockTarget, form }) => {
  const { api } = useContext(Context);
  return (
    <>
      <Form.Item
        name="path"
        label={<InfoToolTip title="安装路径" placeholder="安装路径当前选中页面的路径" />}
        rules={[{ required: true, message: '安装路径为必填项！' }]}
      >
        <Input disabled />
      </Form.Item>
      <Form.Item
        name="name"
        label={
          <InfoToolTip
            title="名称"
            placeholder="区块的源代码将会放在 [安装路径]\[名称]的位置，并且将作为变量名加入页面中。"
          />
        }
        rules={[
          { required: true, message: '名称为必填项!' },
          {
            validator: async (rule, name) => {
              const { exists } = (await api.callRemote({
                type: 'org.umi.block.checkExistFilePath',
                payload: {
                  path: `${blockTarget}/${name}`,
                },
              })) as {
                exists: boolean;
              };
              if (exists) {
                throw new Error('目标路径已存在文件!');
              }
              const blockFileTarget = form.getFieldValue('path');
              const { exists: varExists } = (await api.callRemote({
                type: 'org.umi.block.checkBindingInFile',
                payload: {
                  path: blockFileTarget,
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
