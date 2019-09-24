import React, { useState } from 'react';
import { IUiApi } from 'umi-types';
import { Modal, Button, Input, Switch } from 'antd';

// antd 4.0 not support TreeSelect now.
import TreeSelect from '../TreeSelect';
import useCallData from '../hooks/useCallData';
import { AddBlockParams, Block, Resource } from '../../../data.d';
import styles from './index.module.less';

interface Props {
  onAdded: (params: AddBlockParams) => void;
  block: Block;
  api: IUiApi;
  blockType: Resource['blockType'];
}

const Adder: React.FC<Props> = props => {
  const { onAdded, block, children, blockType, api } = props;
  const { callRemote } = api;

  const [visible, setVisible] = useState<boolean>(false);
  const [path, setPath] = useState<string>(block.defaultPath);
  const [routePath, setRoutePath] = useState<string>(block.defaultPath.toLocaleLowerCase());
  const [name, setName] = useState<string>(block.url.split('/').pop());
  const [transformJS, setTransformJS] = useState<boolean>(false);
  const [removeLocale, setRemoveLocale] = useState<boolean>(false);

  const { data: routePathTreeData } = useCallData(
    () => {
      return callRemote({
        type: 'org.umi.block.routes',
      }) as any;
    },
    [],
    {
      defaultData: [],
    },
  );

  const { data: pageFoldersTreeData } = useCallData(
    () => {
      return callRemote({
        type: 'org.umi.block.pageFolders',
      }) as any;
    },
    [],
    {
      defaultData: [],
    },
  );

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
        }}
      >
        {children}
      </Button>
      {visible && (
        <Modal
          title="添加区块"
          visible={visible}
          onCancel={() => {
            setVisible(false);
          }}
          onOk={() => {
            onAdded({
              url: block.url,
              name,
              path,
              routePath,
              isPage: false,
              transformJS,
              removeLocale,
            });
          }}
        >
          <div>
            <div className={styles.label}>选择路由</div>
            <TreeSelect
              value={routePath}
              placeholder="请选择路由"
              selectable
              onSelect={selectedKeys => {
                setRoutePath(selectedKeys[0]);
              }}
              treeData={routePathTreeData}
            />
            <div className={styles.label}>选择安装路径</div>
            <TreeSelect
              value={path}
              placeholder="请选择安装路径"
              selectable
              onSelect={selectedKeys => {
                setPath(selectedKeys[0]);
              }}
              treeData={pageFoldersTreeData}
            />
            {blockType === 'block' && (
              <>
                <div className={styles.label}>区块名称</div>
                <Input value={name} onChange={e => setName(e.target.value)} />
              </>
            )}
            <div className={styles.label}>编译为 JS</div>
            <Switch checked={transformJS} onChange={setTransformJS} />
            <div className={styles.label}>移除国际化</div>
            <Switch checked={removeLocale} onChange={setRemoveLocale} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default Adder;
