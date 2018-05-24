# umi-plugin-dva

umi的dva插件。

.umirc.js
```js
export default {
  plugins: [
    "umi-plugin-dva"
  ]
};
```
支持配置
```js
export default {
  plugins: [
    ["umi-plugin-dva",{
         immer: true, //default:false
         exclude: [
          /^\$/
        ],//这里是以$开头的model不会被引用
    }]
  ]
};
```
exclude:提供src/models下的文件不被注册的功能，比如加上$前缀就不会被注册了,值为正则表达式
