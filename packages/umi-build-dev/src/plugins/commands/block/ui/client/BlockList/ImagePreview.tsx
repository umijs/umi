import React, { useState, useContext } from 'react';
import { Eye } from '@ant-design/icons';
import { Tooltip, Button, Modal } from 'antd';
import Context from '../UIApiContext';

export default function(props) {
  const { api } = useContext(Context);
  const { intl } = api;
  const { cls, img } = props;
  const [visible, setVisible] = useState(false);
  const [width] = useState(document.documentElement.clientWidth * 0.8);

  return (
    <>
      <Tooltip title={intl({ id: 'org.umi.ui.blocks.list.preview.image' })} placement="bottom">
        <Button
          className={cls}
          onClick={() => {
            setVisible(true);
          }}
        >
          <Eye />
        </Button>
      </Tooltip>
      <Modal
        title={intl({ id: 'org.umi.ui.blocks.list.preview.image' })}
        closable
        visible={visible}
        destroyOnClose
        centered
        width={width}
        bodyStyle={{
          overflow: 'auto',
        }}
        footer={null}
        onCancel={() => {
          setVisible(false);
        }}
        onOk={() => {
          setVisible(false);
        }}
      >
        <div
          style={{
            width: '100%',
            overflow: 'auto',
          }}
        >
          <img src={img} />
        </div>
      </Modal>
    </>
  );
}
