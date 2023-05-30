import React from 'react';
import { TextLoop } from 'react-text-loop-next';
import GithubStar from './GithubStar';
// @ts-ignore
import { Link } from 'umi';
// @ts-ignore
import './index.css';

export default () => {
  // TODO: github stars 存 localStorage
  //  采用 stale-while-revalidate 的策略
  return (
    <div className="hero-normal">
      <div className="hero-bg" />
      <div className="hero-wrapper">
        <div className="hero-left">
          <div className="hero-bigLogo" />
          <div className="hero-actions">
            <Link to="/docs/tutorials/getting-started">
              <div className="hero-button">快速上手 →</div>
            </Link>
            <div className="hero-githubStar">
              <GithubStar />
            </div>
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-bigSlogan1"></div>
          <div className="hero-bigSlogan2"></div>
          <div className="hero-slogan">
            用 Umi 构建你的下一个{' '}
            <TextLoop>
              <strong>React</strong>
              <strong>Vue</strong>
              <strong>PC</strong>
              <strong>Mobile</strong>
              <strong>SPA</strong>
              <strong>SSR</strong>
              <strong>CSR</strong>
              <strong>中后台</strong>
            </TextLoop>{' '}
            应用
          </div>
          <div className="hero-slogan">
            带给你<strong>简单</strong>而<strong>愉悦</strong>的 Web 开发体验
          </div>
          <div className="hero-bow" />
        </div>
      </div>
    </div>
  );
};
