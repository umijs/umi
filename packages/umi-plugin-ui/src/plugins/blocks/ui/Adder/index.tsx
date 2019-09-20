import React, { useState } from 'react';
import { Modal, Button, Input, Switch } from 'antd';
import { AddBlockParams, Block } from '../../data';
import styles from './index.module.less';

interface Props {
  onAdded: (params: AddBlockParams) => void;
  block: Block;
}

const Adder: React.FC<Props> = props => {
  const { onAdded, block, children } = props;
  const [visible, setVisible] = useState<boolean>(false);
  const [path, setPath] = useState<string>(block.defaultPath);
  const [name, setName] = useState<string>(block.url.split('/').pop());
  const [transformJS, setTransformJS] = useState<boolean>(false);
  const [removeLocale, setRemoveLocale] = useState<boolean>(false);
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
              isPage: false,
              transformJS,
              removeLocale,
            });
          }}
        >
          <div>
            <div className={styles.label}>选择安装路径</div>
            <Input value={path} onChange={e => setPath(e.target.value)} />
            <div className={styles.label}>区块名称</div>
            <Input value={name} onChange={e => setName(e.target.value)} />
            <div className={styles.label}>编译为 JS</div>
            <Switch value={transformJS} onChange={setTransformJS} />
            <div className={styles.label}>移除国际化</div>
            <Switch value={removeLocale} onChange={setRemoveLocale} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default Adder;
