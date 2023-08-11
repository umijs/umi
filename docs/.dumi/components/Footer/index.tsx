import React from 'react';
import styled from 'styled-components';
import { Link } from 'umi';
import { NewsLetterForm } from './NewsLetterForm';

const FooterWrapper = styled.div`
  padding: 40px 0;
  .foot-wrapper {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    .left {
      flex: 1;
      .line {
        line-height: 40px;
        display: flex;
      }

      .line h3 {
        font-size: 18px;
        width: 92px;
        margin-right: 66px;
        margin-top: 0;
        margin-bottom: 0;
        font-weight: 400;
        color: #4a5e71;
      }

      .line div {
        flex: 1;
        color: #4a5e71;
      }

      .line div a {
        text-decoration: none;
        color: #4a5e71;
      }
    }

    .right {
      min-width: 400px;
      font-size: 16px;
      .copyright {
        font-size: 14px;
        color: #8996a1;
        line-height: 22px;
        margin-top: 24px;
      }
    }
  }
`;

export const Footer = () => {
  return (
    <FooterWrapper>
      <div className="foot-wrapper">
        <div className="left">
          <div className="line">
            <h3>文档和帮助</h3>
            <div>
              <a target="_blank" href="https://fb.umijs.org">
                反馈和交流群
              </a>{' '}
              ·{' '}
              <a target="_blank" href="https://github.com/umijs/umi/issues">
                给 Umi 提 Bug
              </a>{' '}
              · <Link to="/docs/introduce/contributing">向 Umi 贡献代码</Link> ·{' '}
              <Link to="/docs/introduce/upgrade-to-umi-4">升级到 Umi 4</Link>
            </div>
          </div>
          <div className="line">
            <h3>Umi 生态</h3>
            <div>
              <Link to="/blog/umi-4-rc">开发日志</Link> · 团队 · 里程碑 ·{' '}
              <a target="_blank" href="https://qiankun.umijs.org/">
                乾坤
              </a>
            </div>
          </div>
          <div className="line">
            <h3>Umi 资源</h3>
            <div>
              <Link to="/docs/introduce/introduce">文档</Link> · 示例 · 插件 ·{' '}
              <a target="_blank" href="https://github.com/umijs/umi/releases">
                发布日志
              </a>
            </div>
          </div>
        </div>
        <div className="right">
          <NewsLetterForm />
        </div>
      </div>
    </FooterWrapper>
  );
};
