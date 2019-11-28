import React from 'react';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const InfoToolTip: React.FC<{ title: string; placeholder: string }> = ({ title, placeholder }) => (
  <Tooltip title={placeholder}>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {title}
      <QuestionCircleOutlined
        style={{
          marginLeft: 8,
        }}
      />
    </div>
  </Tooltip>
);

export default InfoToolTip;
