import React, { useState, useContext, useEffect } from 'react';
import { IUiApi } from 'umi-types';
import { Modal, Switch, Select, Tooltip, Form, message, Input } from 'antd';
import { QuestionCircle } from '@ant-design/icons';
import upperCamelCase from 'uppercamelcase';

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
  visible?: boolean;
  blockType?: Resource['blockType'];
  onHideModal?: () => void;
  blockTarget?: string;
  path?: string;
  index?: string;
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

/**
 * 安装区块
 * @param api
 * @param params
 */
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

const cancelAddBlockTask = (api: IUiApi) => {
  return api.callRemote({
    type: 'org.umi.block.cancel',
  });
};

const Adder: React.FC<AdderProps> = props => {
  const { visible, blockTarget, onHideModal, path, index, block = { url: '' }, blockType } = props;
  const { api } = useContext(Context);
  const { callRemote } = api;

  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  // 防止重复提交
  const [fromCheck, setFromCheck] = useState<boolean>(false);

  const [form] = Form.useForm();
  // const [npmClients, setNpmClients] = useState<string[]>(['npm']);
  useEffect(() => {
    if (api.detectNpmClients) {
      api.detectNpmClients().then(clients => {
        form.setFieldsValue({
          npmClient: clients[0],
        });
      });
    }
  }, []);

  // 展示哪个界面
  // log 日志  form 表单
  const [addStatus, setAddStatus] = useState<'form' | 'log'>('form');

  /**
   * 这两个在 visible 的时候回重新加载一下
   */
  const { data: routePathTreeData } = useCallData(
    async () =>
      visible &&
      (callRemote({
        type: 'org.umi.block.routes',
      }) as any),
    [visible],
    {
      defaultData: [],
    },
  );

  const { data: pageFoldersTreeData } = useCallData(
    async () =>
      visible &&
      (callRemote({
        type: 'org.umi.block.pageFolders',
      }) as any),
    [visible],
    {
      defaultData: [],
    },
  );

  const { data: npmClients = [] } = useCallData(
    () =>
      callRemote({
        type: '@@project/getNpmClients',
      }) as any,
    [],
    {
      defaultData: ['npm'],
    },
  );

  useEffect(() => {
    /**
     * 成功之后清理状态
     */
    api.listenRemote({
      type: 'org.umi.block.add-blocks-success',
      onMessage: () => {
        setTaskLoading(false);
        message.success('添加完成！');
      },
    });

    const setTransformJS = async () => {
      // detect language
      if (api.detectLanguage) {
        const language = await api.detectLanguage();
        form.setFieldsValue({
          transformJS: language === 'JavaScript',
        });
      }
    };
    setTransformJS();
  }, []);

  useEffect(
    () => {
      if (path) {
        form.setFieldsValue({ path });
      }
    },
    [path],
  );

  useEffect(
    () => {
      if (index !== null && index !== undefined) {
        form.setFieldsValue({ index });
      }
    },
    [index],
  );

  useEffect(
    () => {
      if (!block || !block.url) {
        return;
      }
      // 生成 defaultName
      const defaultName = block.url.split('/').pop();

      /**
       * 默认值，自动拼接一下 name
       */
      const initialValues = {
        path: `/${defaultName}`,
        routePath: `/${upperCamelCase(defaultName)}`,
        name: upperCamelCase(defaultName),
      };

      form.setFieldsValue(initialValues);
    },
    [block ? block.url : ''],
  );

  if (!block || !block.url) {
    return null;
  }

  const initialValues = {
    transformJS: false,
    removeLocale: false,
    npmClient: 'npm',
  };
  // 如果不是 min 或者 是区块，就显示路由配置
  const needRouterConfig = !api.isMini() || blockType === 'template';

  return (
    <Modal
      title="添加"
      visible={visible}
      destroyOnClose
      onCancel={() => {
        onHideModal();
        if (!taskLoading) {
          setAddStatus('form');
        }
      }}
      confirmLoading={fromCheck}
      bodyStyle={{
        maxHeight: '60vh',
        overflow: 'auto',
      }}
      centered
      okText={renderOkText(addStatus, taskLoading)}
      onOk={() => {
        if (addStatus === 'log' && !taskLoading) {
          onHideModal();
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
            onOk: async () => {
              await cancelAddBlockTask(api);
              setTaskLoading(false);
            },
          });
          return;
        }

        // loading 状态更新
        setTaskLoading(true);
        setFromCheck(true);

        form
          .validateFields()
          .then(async (values: any) => {
            setAddStatus('log');
            const params: AddBlockParams = {
              ...values,
              url: block.url,
              path: blockType === 'block' ? values.path : values.path,
              routePath: blockType === 'template' ? values.routePath : undefined,
              isPage: false,
              index: parseInt(values.index || '0', 0),
              name: values.name,
            };
            try {
              addBlock(api, params);
            } catch (error) {
              message.error(error.message);
            }
          })
          .catch(() => setTaskLoading(false))
          .finally(() => setFromCheck(false));
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
        {!needRouterConfig ? (
          <Form.Item
            name="path"
            label={<InfoToolTip title="安装路径" placeholder="安装路径当前选中页面的路径" />}
            rules={[{ required: true, message: '安装路径为必填项！' }]}
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
              { required: true, message: '安装路径为必填项！' },
              {
                validator: async (rule, filePath) => {
                  if (filePath === '/') {
                    throw new Error('安装文件夹不能为根目录！');
                  }
                  const { exists } = (await callRemote({
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
            <TreeSelect
              placeholder="请选择安装路径"
              filterPlaceholder="筛选安装路径"
              selectable
              treeData={pageFoldersTreeData}
            />
          </Form.Item>
        )}
        {!needRouterConfig && (
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
                  const { exists } = (await callRemote({
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
                  const { exists: varExists } = (await callRemote({
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
        )}
        <Form.Item name="transformJS" label="编译为 JS" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="removeLocale" label="移除国际化" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="npmClient" label="包管理器">
          <Select>
            {npmClients.map(client => (
              <Select.Option value={client}>{client}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="index">
          <input type="hidden" />
        </Form.Item>
      </Form>
      {addStatus === 'log' && <LogPanel loading={taskLoading} />}
    </Modal>
  );
};

export default Adder;
