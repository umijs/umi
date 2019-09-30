import React, { useState, useContext, useEffect } from 'react';
import { IUiApi } from 'umi-types';
import { Modal, Switch, Select, Form, message } from 'antd';

import upperCamelCase from 'uppercamelcase';

import Context from '../UIApiContext';
import useCallData from '../hooks/useCallData';
import { AddBlockParams, Block, Resource } from '../../../data.d';
import LogPanel from '../LogPanel';
import ResultPanel from './ResultPanel';
import AddTemplateForm from './AddTemplateForm';
import AddBlockFormForUI from './AddBlockFormForUI';
import AddBlockForm from './AddBlockForm';
import { getPathFromFilename } from '../BlockList/BlockItem';

interface AdderProps {
  onAddBlockChange?: (block: Block) => void;
  block: Block;
  visible?: boolean;
  blockType?: Resource['blockType'];
  onHideModal?: () => void;
  blockTarget?: string;
  path?: string;
  index?: number;
}

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

const renderOkText = (addStatus: 'form' | 'log' | 'result', loading: boolean) => {
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

const CodeTag: React.FC<{}> = ({ children }) => {
  return (
    <code
      style={{
        backgroundColor: '#3b3b4d',
        margin: '0 8px',
        padding: '2px 8px',
        borderRadius: 4,
      }}
    >
      {children}
    </code>
  );
};

const Adder: React.FC<AdderProps> = props => {
  const {
    visible,
    blockTarget,
    onAddBlockChange,
    onHideModal,
    path,
    index,
    block = { url: '' },
    blockType,
  } = props;
  const { api } = useContext(Context);
  const { callRemote } = api;

  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  // 防止重复提交
  const [fromCheck, setFromCheck] = useState<boolean>(false);

  const [form] = Form.useForm();

  // 展示哪个界面
  // log 日志  form 表单
  const [addStatus, setAddStatus] = useState<'form' | 'log' | 'result'>('form');

  // 预览界面需要消费的日志
  const [successedBlock, setSuccessedBlock] = useState<{
    previewUrl: string;
    name: string;
  }>(undefined);

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

  useEffect(
    () => {
      if (api.detectNpmClients) {
        api.detectNpmClients().then(clients => {
          form.setFieldsValue({
            npmClient: clients.find(c => {
              return npmClients.includes(c);
            }),
          });
        });
      }
    },
    [npmClients],
  );

  useEffect(() => {
    /**
     * 成功之后清理状态
     */
    api.listenRemote({
      type: 'org.umi.block.add-blocks-success',
      onMessage: msg => {
        setTaskLoading(false);
        onAddBlockChange(undefined);

        // 设置预览界面
        setAddStatus('result');
        setSuccessedBlock(msg.data);
      },
    });

    /**
     * 失败之后清理状态
     * 应该保留日志，所以进行页面的切换
     */
    api.listenRemote({
      type: 'org.umi.block.add-blocks-fail',
      onMessage: () => {
        setTaskLoading(false);
        onAddBlockChange(undefined);
        message.error('添加失败，请重试！');
      },
    });

    /**
     * 获取上次的安装的区块 url
     */
    callRemote({
      type: 'org.umi.block.get-adding-block-url',
    }).then(({ data }: { data: string }) => {
      if (data) {
        // 如果有安装未完成的区块，设置显示页面为log
        // 并打开loading
        setAddStatus('log');
        setTaskLoading(true);
      }
    });

    // detect language
    if (api.detectLanguage) {
      api.detectLanguage().then(language => {
        form.setFieldsValue({
          js: language === 'JavaScript',
        });
      });
    }
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
      const initPath = blockType !== 'template' ? '/' : `/${defaultName}`;
      const initialValues = {
        path: initPath,
        routePath: `/${defaultName.toLocaleLowerCase()}`,
        name: upperCamelCase(defaultName),
      };
      form.setFieldsValue(initialValues);
    },
    [block ? block.url : ''],
  );

  if (!block || !block.url) {
    return null;
  }

  /**
   * 计算初始值
   */
  const initialValues = {
    js: false,
    uni18n: localStorage.getItem('umi-ui-block-removeLocale') === 'true',
    npmClient: 'npm',
  };
  return (
    <Modal
      title={
        <div
          style={{
            display: 'flex',
          }}
        >
          添加 <CodeTag>{block.name}</CodeTag>
        </div>
      }
      closable
      visible={visible}
      destroyOnClose
      onCancel={() => {
        onHideModal();
        if (!taskLoading) {
          setAddStatus('form');
        }
      }}
      footer={addStatus === 'result' ? null : undefined}
      confirmLoading={fromCheck}
      bodyStyle={{
        height: '60vh',
        overflow: 'auto',
        transition: '.3s',
      }}
      centered
      okText={renderOkText(addStatus, taskLoading)}
      onOk={() => {
        if (addStatus === 'log' && !taskLoading) {
          onHideModal();
          setAddStatus('form');
          setSuccessedBlock(undefined);
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
              onAddBlockChange(undefined);
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
              path: await getPathFromFilename(api, values.path),
              routePath: blockType === 'template' ? values.routePath : undefined,
              page: blockType === 'template',
              index: parseInt(values.index || '0', 0),
              name: blockType === 'template' ? block.name : values.name,
            };
            try {
              addBlock(api, params);
              localStorage.setItem('umi-ui-block-removeLocale', values.uni18n);
              onAddBlockChange(block);
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
        {blockType === 'template' && <AddTemplateForm visible={visible} blockType={blockType} />}
        {blockType === 'block' && !api.isMini() && <AddBlockForm form={form} visible={visible} />}
        {blockType === 'block' && api.isMini() && (
          <AddBlockFormForUI form={form} blockTarget={blockTarget} />
        )}

        <Form.Item name="js" label="编译为 JS" valuePropName="checked" style={{ display: 'none' }}>
          <Switch />
        </Form.Item>
        {blockType === 'template' && (
          <Form.Item name="uni18n" label="移除国际化" valuePropName="checked">
            <Switch />
          </Form.Item>
        )}
        <Form.Item name="npmClient" label="包管理器">
          <Select>
            {npmClients.map(client => (
              <Select.Option key={client} value={client}>
                {client}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="index">
          <input type="hidden" />
        </Form.Item>
      </Form>
      {addStatus === 'log' && <LogPanel loading={taskLoading} />}
      {addStatus === 'result' && successedBlock && (
        <ResultPanel
          onFinish={() => {
            onHideModal();
            setAddStatus('form');
            setSuccessedBlock(undefined);
            api.hideMini();
          }}
          name={successedBlock.name || block.name}
          url={successedBlock.previewUrl}
        />
      )}
    </Modal>
  );
};

export default Adder;
