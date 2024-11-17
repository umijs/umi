---
order: 3
toc: content
group:
  title: Blog
---

# 比 Vite 还快的 MFSU

<p style={{ color: 'blue' }}>
  编者按：Change the code, don't Workaround! Webpack
  慢就去改他，优化到位后，Bundle 也可以很快。此方案会在 Umi 4
  中默认开启，适用于既要 Webpack 功能与生态，又想要 Vite 速度的同学们。
</p>

Umi 4 中同时支持 webpack 和 vite 两种构建方式，跑通了后，迫不及待对比了 Vite 和 Webpack + MFSU 的效果，结果有点意外。关于什么是 MFSU，我在[《SEE Conf: Umi 4 设计思路文字稿》](https://mp.weixin.qq.com/s?__biz=MjM5NDgyODI4MQ%3D%3D&mid=2247484533&idx=1&sn=9b15a67b88ebc95476fce1798eb49146)中有一段详细介绍。

<p>
  <span style={{ color: 'red', fontWeight: 'bold' }}>
    两个示例、四种模式、四个维度的对比。
  </span>
  两个示例分别是大型的全量 ant-design-pro 和小型的 libs example；四种模式分别是 webpack、webpack + MFSU、webpack + MFSU with esbuild mode、Vite in umi；四个维度分别是无缓存的冷启动、有缓存的热启动、修改代码后的热更新、页面打开速度。
</p>

多说几点和统计相关的。上述 webpack 相关模式全部开启物理缓存；Vite 是 Umi 中集成后的 Vite，也有担心是不是 Umi 对于 Vite 的误用，经开发者确认，基本排除误用的可能性，大段时间消耗在预编译依赖上；Ant Design Pro 中包含 less 的使用，这是使用 esbuild 无法加速的部分，这有影响，但对于不同模式应该是公平的；下图数据是本地用 13-inch M1 2022 重启电脑后跑 5 次后平均取值的结果；Vite 的热更速度没统计是因为由于 esm 的特性，改完后要等请求过来后处理完才算结束，无法统计，但肯定是很快的。

直接上结果。有兴趣手动验证的同学可到 umijs/umi 仓库的不同 example 目录下执行 npm run dev 验证。

![](https://img.alicdn.com/imgextra/i4/O1CN01Gz9AA81szqy3BbRfK_!!6000000005838-2-tps-2150-1084.png)

<p style={{ color: 'gray', marginTop: 0, textAlign: 'center' }}>
  图：全量 ant-design-pro 速度对比图
</p>

![](https://img.alicdn.com/imgextra/i1/O1CN01HNfH7l23L3SRjJUka_!!6000000007238-2-tps-2058-1078.png)

<p style={{ color: 'gray', marginTop: 0, textAlign: 'center' }}>
  图：libs example 速度对比图
</p>

可以看到，**在这几个场景下，MFSU with esbuild 数据领先。** 四个模式的页面打开速度差不多，所以对比数据没在图中列出，这也是让我意外的点，原以为 Vite 请求多会让页面打开速度变慢，也有可能项目还不够复杂？
