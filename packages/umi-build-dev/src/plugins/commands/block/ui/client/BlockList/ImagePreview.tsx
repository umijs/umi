import React, { useState, useContext } from 'react';
import { EyeOutlined } from '@ant-design/icons';
import { Tooltip, Button, Modal } from 'antd';
import Context from '../UIApiContext';

export default props => {
  const { api } = useContext(Context);
  const { intl } = api;
  const { cls, img } = props;
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Tooltip title={intl({ id: 'org.umi.ui.blocks.list.preview.image' })} placement="bottom">
        <Button
          className={cls}
          onClick={() => {
            setVisible(true);
          }}
        >
          <EyeOutlined />
        </Button>
      </Tooltip>
      <Modal
        title={intl({ id: 'org.umi.ui.blocks.list.preview.image' })}
        closable
        visible={visible}
        destroyOnClose
        centered
        width="80vw"
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
          <img style={{ width: '100%' }} src={img} />
        </div>
      </Modal>
    </>
  );
};
