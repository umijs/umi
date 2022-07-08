# Module Federation 

在 Umi 项目使用 Module Federation。

## 安装

`@umijs/max` 项目

```ts
// .umirc.ts
defineConfig({
    // 已经内置 Module Federation 插件, 直接开启配置即可

    mf: {
        name: 'exportMFName',
        fieldName: 'name',
        remotes: [
            {
                aliasName: 'mfNameAlias', // 可选，未配置则使用当前 remotes[].name 字段
                name: 'theMfName',
                entry: 'https://to.the.remote.com/remote.js',
            },
        ],
        // 可选，远端模块库类型, 如果模块需要在乾坤子应用中使用建议配置示例的值，
        // 注意这里的 name 必须和最终 MF 模块的 name 一致
        library: { type: "window", name: "exportMFName" },
    },
    mfsu: false, // 目前和 mfsu 不兼容 开发阶段需要关闭
    // 配置 MF 共享的模块
    shared：{
        lodash: {eager: true}, 
    },
})
```

普通 Umi 项目

```ts
// .umirc.ts
defineConfig({
    plugins: [
        '@umijs/plugins/dist/mf',
    ],
    mf: {
        name: 'exportMFName',
        fieldName: 'name',
        remotes: [
            {
                aliasName: 'mfNameAlias', // 可选，未配置则使用当前 remotes[].name 字段
                name: 'theMfName',
                entry: 'https://to.the.remote.com/remote.js',
            },
        ],
        // 可选，远端模块库类型, 如果模块需要在乾坤子应用中使用建议配置示例的值，
        // 注意这里的 name 必须和最终 MF 模块的 name 一致
        library: { type: "window", name: "exportMFName" },
    },
    mfsu: false, // 目前和 mfsu 不兼容 开发阶段需要关闭  
    // 配置 MF 共享的模块
    shared：{
        lodash: {eager: true}, 
    }         
})
```


注意：mf 插件默认配置了 `react` 和 `react-dom` 为 `shared`, 具体配置如下：

```js
{
  shared: {
    react: {
      singleton: true,
      eager: true,
    },
    'react-dom': {
      singleton: true,
      eager: true,
    },
  }
}
```
