import { IRoute } from '@/hooks/useAppData';
import { Drawer } from 'antd';
import React from 'react';
import { styled } from 'umi';

const Wrapper = styled.div`
  color: #333;

  .info-item {
    margin-bottom: 1rem;

    .label {
      margin-top: 0.5rem;
      overflow: auto;
      background: #f0f0f0;
      border-radius: 0.5rem;
      padding: 0.5rem 1rem;
    }
  }
`;

export const RouteDrawer: React.FC<{
  open: boolean;
  info: IRoute;
  onClose: () => void;
}> = ({ open, info, onClose }) => {
  if (!info) {
    return null;
  }

  // todo 增加跳转功能
  // todo 显示imports的组件
  return (
    <>
      <Drawer
        title="Route Information"
        placement="left"
        open={open}
        width={600}
        onClose={onClose}
        mask={false}
      >
        <Wrapper>
          {info.name ? (
            <div className="info-item">
              <h3>Name</h3>
              <div className="label">{info.name}</div>
            </div>
          ) : null}
          <div className="info-item">
            <h3>RoutePath</h3>
            <div className="label">{info.absPath}</div>
          </div>
          {info.file ? (
            <div className="info-item">
              <h3>FilePath</h3>
              <div className="label">{info.file}</div>
            </div>
          ) : null}
          {info.redirect ? (
            <div className="info-item">
              <h3>Redirect</h3>
              <div className="label">{info.redirect}</div>
            </div>
          ) : null}
        </Wrapper>
      </Drawer>
    </>
  );
};
