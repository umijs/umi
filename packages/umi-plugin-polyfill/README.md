# umi-plugin-polyfill

umi的兼容插件，主要是为了umi兼容ie而创建的，所以现在内置了babel/polyfill和setprototypeof和window.NodeList，处理在ie下的兼容，但考虑到后续的扩展和可能存在的其他兼容问题，增加了extend配置。


在.umirc.js用法：
简单用法：
```js
export default {
  plugins: [
    "umi-plugin-polyfills"
  ]
};
```
如果在你的项目中，需要加入其他的兼容插件，你可以使用下面的方法实现：
```js
export default {
  plugins: [
    ["umi-plugin-polyfills",{
      extend:['model name']
    }]
  ]
};
```
这里接受一个entend数组，值为模块名(如：'url-polyfill')或者相对于根目录的文件(如：'./src/polyfill/i.js')


后续考虑加入
- 动画的兼容，可能是web-animations-js
- url兼容，可能是url-polyfill
- SVG elements，可能是classlist.js
- 其他