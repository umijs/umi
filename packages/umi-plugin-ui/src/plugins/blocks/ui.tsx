import React, { useState, useEffect, useContext } from 'react';
import { Input, Spin, Button, Form } from 'antd';
import { IUiApi, IUi } from 'umi-types';
import decamelize from 'decamelize';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
// @ts-ignore
import styles from './ui.module.less';

const { Search } = Input;

function nameToPath(name) {
  return `/${decamelize(name, '-')}`;
}

export default (api: IUiApi) => {
  const { callRemote, getContext, intl, Field } = api;

  console.log('intl', intl({ id: 'org.umi.ui.blocks.panel' }));

  const BlocksViewer: React.SFC<{}> = () => {
    const [blockAdding, setBlockAdding] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    // const { locale, formatMessage } = useContext(getContext());

    useEffect(() => {
      (async () => {
        setLoading(true);
        const blocks = await callRemote({
          type: 'blocks/fetch',
        });
        setBlocks(blocks);
        setLoading(false);
      })();
    }, []);

    function addHandler(name) {
      (async () => {
        let path = nameToPath(name);
        const blockExists = await callRemote({
          type: 'blocks/checkExists',
          payload: {
            path,
          },
        });

        // block 存在时加数字后缀找一个不存在的
        if (blockExists) {
          let count = 2;
          while (true) {
            const blockExists = await callRemote({
              type: 'blocks/checkExists',
              payload: {
                path: `${path}-${count}`,
              },
            });
            if (blockExists) {
              count += 1;
            } else {
              path = `${path}-${count}`;
              break;
            }
          }
        }

        setBlockAdding(name);
        await callRemote({
          type: 'blocks/add',
          payload: {
            name,
            path,
          },
        });
        setBlockAdding(null);
      })();
    }

    const handleNotify = () => {
      api.notify({
        title: 'org.umi.ui.blocks.notify.title',
        message: 'org.umi.ui.blocks.notify.message',
        type: 'success',
      });
    };

    const [form] = Form.useForm();

    // const data: IUi.IFieldProps[] = [
    //   { ti }
    // ]

    return (
      <div className={styles.normal}>
        <Form
          form={form}
          onFinish={values => {
            console.log('valuesvalues', values);
          }}
        >
          <Field form={form} name="hello" label="测试" type="boolean" />
          <Field form={form} name="hello.child" label="测试-子集" type="string" />
          <Button htmlType="submit">Submit</Button>
        </Form>
      </div>
    );
  };

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
    path: '/blocks',
    icon: 'environment',
    component: BlocksViewer,
  });
};
