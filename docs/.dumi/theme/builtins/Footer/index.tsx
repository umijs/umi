import React from 'react';
// @ts-ignore
import { Link } from 'umi';
import NewsLetterForm from './NewsLetterForm';
// @ts-ignore
import './index.css';

export default () => {
  return (
    <div className="footer-normal">
      <div className="footer-wrapper">
        <div className="footer-left">
          <div className="footer-line">
            <h3>文档和帮助</h3>
            <div>
              <a target="_blank" href="https://fb.umijs.org">
                反馈和交流群
              </a>{' '}
              ·{' '}
              <a target="_blank" href="https://github.com/umijs/umi/issues">
                给 Umi 提 Bug
              </a>{' '}
              · <Link to="/docs/introduce-contributing">向 Umi 贡献代码</Link> ·{' '}
              <Link to="/docs/introduce-upgrade-to-umi-4">升级到 Umi 4</Link>
            </div>
          </div>
          <div className="footer-line">
            <h3>Umi 生态</h3>
            <div>
              <Link to="/blog/umi-4-rc">开发日志</Link> · 团队 · 里程碑 ·{' '}
              <a target="_blank" href="https://qiankun.umijs.org/">
                乾坤
              </a>
            </div>
          </div>
          <div className="footer-line">
            <h3>Umi 资源</h3>
            <div>
              <Link to="/docs/introduce-introduce">文档</Link> · 示例 · 插件 ·{' '}
              <a target="_blank" href="https://github.com/umijs/umi/releases">
                发布日志
              </a>
            </div>
          </div>
        </div>
        <div className="footer-right">
          <NewsLetterForm />
          <div className="footer-copyright">
            Open-source MIT Licensed · Copyright © 2017-present
          </div>
        </div>
      </div>
    </div>
  );
};
