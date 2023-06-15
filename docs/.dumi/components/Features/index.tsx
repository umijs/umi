import React from 'react';
import styled from 'styled-components';
import SectionHeader from '../SectionHeader';

const FeaturesWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: 26px;
    padding-top: 40px;
    padding-bottom: 40px;
    padding-left: 0;
    justify-content: center;
  }

  ul li:nth-child(1) div {
    background-image: url(https://img.alicdn.com/imgextra/i1/O1CN01X9PWb51WTrmbiflpT_!!6000000002790-2-tps-200-200.png);
  }
  ul li:nth-child(2) div {
    background-image: url(https://img.alicdn.com/imgextra/i3/O1CN01bQ0kTe1EBOjKuXpqp_!!6000000000313-2-tps-200-202.png);
  }
  ul li:nth-child(3) div {
    background-image: url(https://img.alicdn.com/imgextra/i2/O1CN013xl2111M1nLrWyeFh_!!6000000001375-2-tps-200-202.png);
  }
  ul li:nth-child(4) div {
    background-image: url(https://img.alicdn.com/imgextra/i2/O1CN01u39OgG1KsLZ2sIJMg_!!6000000001219-2-tps-200-202.png);
  }
  ul li:nth-child(5) div {
    background-image: url(https://img.alicdn.com/imgextra/i4/O1CN01h5IQ8c1mll6tVqVhQ_!!6000000004995-2-tps-200-200.png);
  }
  ul li:nth-child(6) div {
    background-image: url(https://img.alicdn.com/imgextra/i1/O1CN01y7KgLZ26MNTamgba7_!!6000000007647-2-tps-200-200.png);
  }
  ul li:nth-child(7) div {
    background-image: url(https://img.alicdn.com/imgextra/i4/O1CN016Wo1XZ1dSg4HhJn0M_!!6000000003735-2-tps-200-200.png);
  }
  ul li:nth-child(8) div {
    background-image: url(https://img.alicdn.com/imgextra/i2/O1CN01ub7E7l1QT3O8vEbCq_!!6000000001976-2-tps-200-200.png);
  }
  .feature-feature {
    width: 280px;
    margin-bottom: 60px;
    list-style: none;
  }

  .feature-feature div {
    width: 100px;
    height: 100px;
    background-size: 100px 100px;
    background-repeat: no-repeat;
    margin: 0 auto 10px;
  }

  .feature-feature h3 {
    font-size: 20px;
    color: #2a445d;
    margin-bottom: 12px;
    text-align: center;
  }
  [data-prefers-color='dark'] .feature-feature h3 {
    color: rgba(255, 255, 255, 0.8);
  }

  .feature-feature p {
    font-size: 18px;
    color: #4a5e71;
  }
  [data-prefers-color='dark'] .feature-feature p {
    color: rgba(255, 255, 255, 0.6);
  }
`;
export default () => {
  return (
    <FeaturesWrapper>
      <SectionHeader title="主要特性" />
      <ul>
        <li className="feature-feature">
          <div></div>
          <h3>开箱即用</h3>
          <p>
            内置路由、构建、部署、测试、Lint 等，仅需一个 Umi 依赖即可上手开发。
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>企业级</h3>
          <p>
            蚂蚁集团 10000+
            应用的选择。同时也在阿里、字节、腾讯、网易、美团、快手等公司有大量应用。
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>最佳实践</h3>
          <p>
            内置微前端、数据流、权限、国际化、icons 方案、埋点、antd、请求、CSS
            方案、图表等最佳实践。
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>可扩展</h3>
          <p>
            Umi 实现了 web 应用开发的完整生命周期，并使之插件化，包括 Umi
            内部功能也是全由插件实现。
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>完备路由</h3>
          <p>
            基于 React Router 6，类
            Remix，支持嵌套、动态、动态可选、预加载、基于路由的请求优化等。
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>默认快</h3>
          <p>
            MFSU 解 Webpack 编译慢的问题，通过 esbuild
            解压缩、配置、测试的性能问题，还有运行时...
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>双构建引擎</h3>
          <p>
            提供 Vite 和 Webpack
            两种构建模式供开发者选择，并尽可能保证他们之间功能的一致性。
          </p>
        </li>
        <li className="feature-feature">
          <div></div>
          <h3>依赖预打包</h3>
          <p>
            Umi
            针对依赖做了预打包处理，彻底地锁定依赖，定期更新，让框架的每个版本在
            10 年后依旧可用。
          </p>
        </li>
      </ul>
    </FeaturesWrapper>
  );
};
