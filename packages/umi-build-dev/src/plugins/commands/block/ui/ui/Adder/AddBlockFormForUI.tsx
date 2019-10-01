/**
 *  在 umi ui 中添加区块
 *  不需要选择安装的具体文件位置
 *  min ui 提供了可视化的方案来选择
 */
import React, { useContext, useState } from 'react';
import { Form, Input } from 'antd';
import { FormInstance } from 'antd/es/form/util';
import Context from '../UIApiContext';
import InfoToolTip from './InfoToolTip';

const PathLabel: React.FC<{
  value?: string;
  name?: string;
}> = ({ value, name }) => (
  <div
    style={{
      display: 'flex',
      marginBottom: 24,
    }}
  >
    区块将被安装到
    <code
      style={{
        backgroundColor: '#3b3b4d',
        margin: '0 8px',
        padding: '0 8px',
        borderRadius: 4,
      }}
    >
      {`${value}/${name}`.replace(/\//g, '/').replace(/\/\//g, '/')}
    </code>
  </div>
);

const AddBlockFormForUI: React.FC<{
  blockTarget: string;
  form: FormInstance;
}> = ({ blockTarget, form }) => {
  const { api } = useContext(Context);
  const [varName, setValueName] = useState<string>(form.getFieldValue('name'));
  return (
    <>
      <Form.Item
        noStyle
        name="path"
        label={<InfoToolTip title="添加到" placeholder="当前选中页面的路径" />}
        rules={[{ required: true, message: '添加路径为必填项！' }]}
      >
        <PathLabel name={varName} />
      </Form.Item>
      <Form.Item
        name="name"
        label={
          <InfoToolTip
            title="变量名"
            placeholder="区块的源代码将会放在 [添加路径]\[名称]的位置，并且将作为变量名加入页面中。"
          />
        }
        rules={[
          {
            validator: async (rule, name) => {
              if (!name) {
                throw new Error('变量名为必填项!');
              }
              if (!/^[a-zA-Z$_][a-zA-Z\d_]*$/.test(name)) {
                throw new Error('变量名不合法!');
              }
              if (!/^(?:[A-Z][a-z]+)+$/.test(name)) {
                throw new Error('变量名不是一个合法的 React 组件名!');
              }
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
        <Input
          placeholder="请输入名称！"
          onChange={e => {
            setValueName(e.target.value);
          }}
        />
      </Form.Item>
    </>
  );
};

export default AddBlockFormForUI;
