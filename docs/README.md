import { Hero, Features, FeatureItem } from 'umi';

<Hero 
  description="以路由为基础，同时支持配置式路由和约定式路由，配以生命周期完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求。"
  buttons={[{label: "快速开始", href: "docs/tutorials/getting-started"}]} 
  githubRepo="umijs/umi"
/>

<Features title="为什么选择 Umi" subtitle="Umi 透过以下几个特色，提供你快速且可靠的前端开发能力">
  <FeatureItem 
    title="可扩展" 
    description="Umi 实现了完整的生命周期，并使其插件化，Umi 内部功能也全由插件完成。此外还支持插件和插件集，以满足功能和垂直域的分层需求。"
    icon="https://gw.alipayobjects.com/zos/basement_prod/a1c647aa-a410-4024-8414-c9837709cb43/k7787itw_w126_h114.png"
  />
  <FeatureItem 
    title="开箱即用" 
    description="Umi 内置了路由、构建、部署、测试等，仅需一个依赖即可上手开发。并且还提供针对 React 的集成插件集，内涵丰富的功能，可满足日常 80% 的开发需求。"
    icon="https://gw.alipayobjects.com/zos/basement_prod/b54b48c7-087a-4984-b150-bcecb40920de/k7787z07_w114_h120.png"
  />
  <FeatureItem 
    title="企业级" 
    description="经蚂蚁内部 3000+ 项目以及阿里、优酷、网易、飞猪、口碑等公司项目的验证，值得信赖。"
    icon="https://gw.alipayobjects.com/zos/basement_prod/464cb990-6db8-4611-89af-7766e208b365/k77899wk_w108_h132.png"
  />
  <FeatureItem 
    title="大量自研" 
    description="包含微前端、组件打包、文档工具、请求库、hooks 库、数据流等，满足日常项目的周边需求。"
    icon="https://gw.alipayobjects.com/zos/basement_prod/201bea40-cf9d-4be2-a1d8-55bec136faf2/k7788a8s_w102_h120.png"
  />
  <FeatureItem 
    title="完备路由" 
    description="同时支持配置式路由和约定式路由，同时保持功能的完备性，比如动态路由、嵌套路由、权限路由等等。"
    icon="https://gw.alipayobjects.com/zos/basement_prod/67b771c5-4bdd-4384-80a4-978b85f91282/k7788ov2_w126_h126.png"
    link="https://umijs.org/zh-CN/docs/routing"
  />
  <FeatureItem 
    title="面向未来" 
    description="在满足需求的同时，我们也不会停止对新技术的探索。比如 modern mode、webpack@5、自动化 external、bundler less 等等。"
    icon="https://gw.alipayobjects.com/zos/basement_prod/d078a5a9-1cb3-4352-9f05-505c2e98bc95/k7788v4b_w102_h126.png"
  />
</Features>
