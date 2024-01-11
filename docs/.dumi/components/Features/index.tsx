import React from 'react';
import { SectionHeader } from '../SectionHeader';
import {
  BOX_IMAGE,
  COMPANY_IMAGE,
  ENGINE_IMAGE,
  EXPAND_IMAGE,
  FAST_IMAGE,
  PACK_IMAGE,
  PRACTICE_IMAGE,
  ROUTER_IMAGE,
} from './image';
import styles from './index.less';

const FeatureItemPicture = ({
  imageUrl,
  children,
}: React.PropsWithChildren<{ imageUrl: string }>) => {
  return (
    <div
      style={{
        backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
      }}
    >
      {children}
    </div>
  );
};

export const Features = () => {
  return (
    <div className={styles.features}>
      <SectionHeader title="主要特性" />
      <ul>
        <li className="feature">
          <FeatureItemPicture imageUrl={BOX_IMAGE}></FeatureItemPicture>
          <h3>开箱即用</h3>
          <p>
            内置路由、构建、部署、测试、Lint 等，仅需一个 Umi 依赖即可上手开发。
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={COMPANY_IMAGE}></FeatureItemPicture>
          <h3>企业级</h3>
          <p>
            蚂蚁集团 10000+
            应用的选择。同时也在阿里、字节、腾讯、网易、美团、快手等公司有大量应用。
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={PRACTICE_IMAGE}></FeatureItemPicture>
          <h3>最佳实践</h3>
          <p>
            内置微前端、数据流、权限、国际化、icons 方案、埋点、antd、请求、CSS
            方案、图表等最佳实践。
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={EXPAND_IMAGE}></FeatureItemPicture>
          <h3>可扩展</h3>
          <p>
            Umi 实现了 web 应用开发的完整生命周期，并使之插件化，包括 Umi
            内部功能也是全由插件实现。
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={ROUTER_IMAGE}></FeatureItemPicture>
          <h3>完备路由</h3>
          <p>
            基于 React Router 6，类
            Remix，支持嵌套、动态、动态可选、预加载、基于路由的请求优化等。
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={FAST_IMAGE}></FeatureItemPicture>
          <h3>默认快</h3>
          <p>
            MFSU 解 Webpack 编译慢的问题，通过 esbuild
            解压缩、配置、测试的性能问题，还有运行时...
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={ENGINE_IMAGE}></FeatureItemPicture>
          <h3>双构建引擎</h3>
          <p>
            提供 Vite 和 Webpack
            两种构建模式供开发者选择，并尽可能保证他们之间功能的一致性。
          </p>
        </li>
        <li className="feature">
          <FeatureItemPicture imageUrl={PACK_IMAGE}></FeatureItemPicture>
          <h3>依赖预打包</h3>
          <p>
            Umi
            针对依赖做了预打包处理，彻底地锁定依赖，定期更新，让框架的每个版本在
            10 年后依旧可用。
          </p>
        </li>
      </ul>
    </div>
  );
};
