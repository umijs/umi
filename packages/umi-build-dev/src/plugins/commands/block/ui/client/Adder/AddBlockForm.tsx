/**
 *  在 umi ui 中添加区块
 *  需要选择安装的具体文件位置
 */
import React, { useContext } from 'react';
import { Form, Input } from 'antd';
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
  const { intl } = api;
  return (
    <>
      <div
        style={{
          display: 'flex',
          marginBottom: 24,
        }}
      >
        {intl({ id: 'org.umi.ui.blocks.adder.minirecommend' })}
      </div>
      <Form.Item
        name="path"
        label={
          <InfoToolTip
            title={intl({ id: 'org.umi.ui.blocks.adder.path' })}
            placeholder={intl({ id: 'org.umi.ui.blocks.adder.path.tooltip' })}
          />
        }
        rules={[{ required: true, message: intl({ id: 'org.umi.ui.blocks.adder.path.rule' }) }]}
      >
        <RouteFilesTreeData visible={visible} />
      </Form.Item>
      <Form.Item
        name="name"
        label={
          <InfoToolTip
            title={intl({ id: 'org.umi.ui.blocks.adder.name' })}
            placeholder={intl({ id: 'org.umi.ui.blocks.adder.name.tooltip' })}
          />
        }
        rules={[
          {
            validator: async (rule, name) => {
              if (!name) {
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.name.required' }));
              }
              if (!/^[a-zA-Z$_][a-zA-Z\d_]*$/.test(name)) {
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.name.illegal' }));
              }
              if (!/^(?:[A-Z][a-z]+)+$/.test(name)) {
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.name.illegalReact' }));
              }

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
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.pathexist' }));
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
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.varexist' }));
              }
            },
          },
        ]}
      >
        <Input placeholder={intl({ id: 'org.umi.ui.blocks.adder.name.placeholder' })} />
      </Form.Item>
    </>
  );
};

export default AddBlockFormForUI;
