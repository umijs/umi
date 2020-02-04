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
import { getNoExitVar, getNoExitRoute, getNoExitPath } from '../util';

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

const cancelAddBlockTask = (api: IUiApi) => {
  return api.callRemote({
    type: 'org.umi.block.cancel',
  });
};

const Adder: React.FC<AdderProps> = props => {
  const {
    visible,
    blockTarget,
    onAddBlockChange,
    onHideModal,
    index,
    block = { url: '' },
    blockType,
  } = props;
  const { api } = useContext(Context);
  const { callRemote, intl, _analyze } = api;
  const { gtag } = _analyze;

  const [taskLoading, setTaskLoading] = useState<boolean>(false);
  // 防止重复提交
  const [fromCheck, setFromCheck] = useState<boolean>(false);

  const [form] = Form.useForm();

  // 展示哪个界面
  // log 日志  form 表单
  const [addStatus, setAddStatus] = useState<'form' | 'log' | 'result'>('form');

  // 预览界面需要消费的日志
  const [succeededBlock, setSucceededBlock] = useState<{
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

  useEffect(() => {
    if (api.detectNpmClients) {
      api.detectNpmClients().then(clients => {
        form.setFieldsValue({
          npmClient: clients.find(c => npmClients.includes(c)),
        });
      });
    }
  }, [npmClients]);

  useEffect(() => {
    /**
     * 成功之后清理状态
     */
    api.listenRemote({
      type: 'org.umi.block.add-blocks-success',
      onMessage: msg => {
        setTaskLoading(false);
        onAddBlockChange(undefined);

        // 如果标签页不激活，不处理它
        if (document.visibilityState !== 'hidden') {
          // 设置预览界面
          setAddStatus('result');
          setSucceededBlock(msg.data);
        } else {
          setAddStatus('form');
        }
        gtag('event', 'add-blocks-success', {
          event_category: 'block',
          event_label: msg.data && msg.data.path ? msg.data.path : '',
        });
      },
    });

    /**
     * 失败之后清理状态
     * 应该保留日志，所以进行页面的切换
     */
    api.listenRemote({
      type: 'org.umi.block.add-blocks-fail',
      onMessage: msg => {
        setTaskLoading(false);
        onAddBlockChange(undefined);
        // 如果标签页不激活，不处理它
        if (document.visibilityState !== 'hidden') {
          message.error(intl({ id: 'org.umi.ui.blocks.adder.failed' }));
        }
        gtag('event', 'add-blocks-fail', {
          event_category: 'block',
          event_label: msg.data && msg.data.path ? msg.data.path : '',
        });
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

  useEffect(() => {
    if (!block || !block.url) {
      return;
    }
    // 生成 defaultName
    const defaultName = block.url.split('/').pop();
    const initPath = blockType !== 'template' ? '/' : `/${defaultName}`;
    const resetInitialValues = async () => {
      // 自动生成一个不存在的变量名
      const noExitVar = await getNoExitVar({
        name: upperCamelCase(defaultName),
        path: blockTarget || initPath,
        api,
        need: !!blockTarget,
      });

      /**
       * 默认值，自动拼接一下 name
       * blockTarget 是 umi min ui 中选出来的以它为主要
       */
      const initialValues = {
        path: await getNoExitPath({
          path: blockTarget || initPath,
          api,
          need: blockType === 'template',
        }),
        // 自动生成一个不存在路由
        routePath: await getNoExitRoute({
          path: `/${defaultName.toLocaleLowerCase()}`,
          api,
          need: blockType === 'template',
        }),
        name: noExitVar,
      };
      form.setFieldsValue(initialValues);
    };
    resetInitialValues();
  }, [block ? block.url : '', blockTarget || '']);

  useEffect(() => {
    if (index !== null && index !== undefined) {
      form.setFieldsValue({ index });
    }
  }, [index]);

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

  const renderOkText = (status: 'form' | 'log' | 'result', loading: boolean) => {
    if (status === 'log' && !loading) {
      return intl({ id: 'org.umi.ui.blocks.adder.stop' });
    }
    if (status === 'log') {
      return intl({ id: 'org.umi.ui.blocks.adder.stop' });
    }
    return intl({ id: 'org.umi.ui.blocks.adder.ok' });
  };

  return (
    <Modal
      title={
        <div
          style={{
            display: 'flex',
          }}
        >
          {intl({ id: `org.umi.ui.blocks.adder.title.${blockType}` })}
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
          setSucceededBlock(undefined);
          return;
        }
        if (addStatus === 'log') {
          Modal.confirm({
            title: intl({ id: 'org.umi.ui.blocks.adder.stop.title' }),
            content: intl({ id: 'org.umi.ui.blocks.adder.stop.content' }),
            okType: 'danger',
            okText: intl({ id: 'org.umi.ui.blocks.adder.stop.okText' }),
            cancelText: intl({ id: 'org.umi.ui.blocks.adder.stop.cancelText' }),
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
            try {
              const params: AddBlockParams = {
                ...values,
                url: block.url,
                path: await getPathFromFilename(api, values.path),
                routePath: blockType === 'template' ? values.routePath : undefined,
                page: blockType === 'template',
                // support: l-${index} or ${index}
                index:
                  values.index && values.index.startsWith('l-')
                    ? values.index
                    : parseInt(values.index || '0', 10),
                name: blockType === 'template' ? block.name : values.name,
              };

              addBlock(api, params);
              localStorage.setItem('umi-ui-block-removeLocale', values.uni18n);
              onAddBlockChange(block);
              gtag('event', 'install-block', {
                event_category: 'block',
                event_label: params && params.path ? params.path : '',
              });
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

        <Form.Item
          name="js"
          label={intl({ id: 'org.umi.ui.blocks.adder.js' })}
          valuePropName="checked"
          style={{ display: 'none' }}
        >
          <Switch size="small" />
        </Form.Item>
        {blockType === 'template' && (
          <Form.Item
            name="uni18n"
            label={intl({ id: 'org.umi.ui.blocks.adder.uni18n' })}
            valuePropName="checked"
          >
            <Switch size="small" />
          </Form.Item>
        )}
        <Form.Item
          name="npmClient"
          label={intl({ id: 'org.umi.ui.blocks.adder.npmClient' })}
          rules={[
            {
              required: true,
              message: intl({ id: 'org.umi.ui.blocks.adder.npmClient.required' }),
            },
          ]}
        >
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
      {addStatus === 'result' && succeededBlock && (
        <ResultPanel
          onFinish={() => {
            onHideModal();
            setAddStatus('form');
            setSucceededBlock(undefined);
            api.hideMini();
          }}
          name={succeededBlock.name || block.name}
          url={succeededBlock.previewUrl}
        />
      )}
    </Modal>
  );
};

export default Adder;
