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
  const { intl } = api;
  return (
    <>
      <Form.Item
        name="routePath"
        label={
          <InfoToolTip
            title={intl({ id: 'org.umi.ui.blocks.adder.routePath' })}
            placeholder={intl({ id: 'org.umi.ui.blocks.adder.routePath.placeholder' })}
          />
        }
        rules={[
          { required: true, message: intl({ id: 'org.umi.ui.blocks.adder.routePath.required' }) },
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
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.routePath.exist' }));
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
            title={intl({ id: 'org.umi.ui.blocks.adder.templatePath' })}
            placeholder={intl({ id: 'org.umi.ui.blocks.adder.templatePath.tooltip' })}
          />
        }
        rules={[
          {
            required: true,
            message: intl({ id: 'org.umi.ui.blocks.adder.templatePath.required' }),
          },
          {
            validator: async (rule, filePath) => {
              if (filePath === '/') {
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.templatePath.root' }));
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
                throw new Error(intl({ id: 'org.umi.ui.blocks.adder.templatePath.exist' }));
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
