import { CodeBlock } from '@/components/CodeBlock';
import { IRoute } from '@/hooks/useAppData';
import { Collapse, Drawer } from 'antd';
import React from 'react';
import { styled } from 'umi';

const { Panel } = Collapse;

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

    .code-label {
      margin-top: 0.5rem;
    }

    .ant-collapse,
    .ant-collapse-item {
      border: 0;

      .ant-collapse-content {
        border: 0;
        background: #f0f0f0;
      }

      .ant-collapse-header {
        background: #f0f0f0;
        border-radius: 0.5rem;
        padding: 0.5rem 1rem;
      }

      .ant-collapse-item-active {
        .ant-collapse-header {
          border-radius: 0.5rem 0.5rem 0 0;
        }
      }
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
              <div className="label">{info.absPath}</div>
            </div>
          ) : null}
          <div className="info-item">
            <h3>RoutePath</h3>
            <div className="label">{info.absPath}</div>
          </div>
          {info.__absFile || info.file ? (
            <div className="info-item">
              <h3>FilePath</h3>
              <div className="label">{info.__absFile || info.file}</div>
            </div>
          ) : null}
          {info.redirect ? (
            <div className="info-item">
              <h3>Redirect</h3>
              <div className="label">{info.redirect}</div>
            </div>
          ) : null}
          <div className="info-item">
            <h3>CodeContent</h3>
            <div className="code-label">
              <Collapse>
                <Panel header="Code Content" key="1">
                  <CodeBlock code={info.__content!} />
                </Panel>
              </Collapse>
            </div>
          </div>
        </Wrapper>
      </Drawer>
    </>
  );
};
