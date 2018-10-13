# umi-plugin-locale

`umi`多语言控制插件。

推荐配合[umi-plugin-react](https://umijs.org/plugin/umi-plugin-react.html)使用。

## 配置

**.umirc.js**

```js
export default {
  plugins: [
    [
      'umi-plugin-react',
      {
        locale: {
          default: 'zh-CN', //默认语言 zh-CN
          baseNavigator: true, // 为true时，用navigator.language的值作为默认语言
          antd: true // 是否启用antd的<LocaleProvider />
        }
      }
    ]
  ]
};
```

## 目录及约定

```
.
├── dist/                          
├── mock/                         
└── src/                          
    ├── layouts/index.js          
    ├── pages/                    
    └── locales               // 多语言文件存放目录，里面的文件会被umi自动读取
        ├── zh-CN.js
        └── en-US.js               
├── .umirc.js                     
├── .env                          
└── package.json
```


>如果`.umirc.js`里配置了`singular: true`，`locales`要改成`locale`


## 多语言文件约定

多语言文件的命名规范：`<lang>-<COUNTRY>.js`


多语言文件的内容规范：键-值组成的字面量，如下：

zh-CN.js

```javascript
export default {
  WELCOME_TO_UMI_WORLD: '{name}，欢迎光临umi的世界',
}
```

en-US.js

```javascript
export default {
  WELCOME_TO_UMI_WORLD: '{name}, welcome to umi\'s world',
}
```

## 扩展API

当使用本插件后，`umi`项目中会新增一个API: `umi/locale`，你可以通过引入这个新的API，获得关于多语言功能在编程上的便利。

```javascript
import { formatMessage, setLocale, getLocale, FormattedMessage } from 'umi/locale'

// 获取指定文字的多语言版本
const formatedText = formatMessage({
  id: 'WELCOME_TO_UMI_WORLD'
}, {
  name: '小伙子',
})

console.log(formatedText === '小伙子，欢迎光临umi的世界')

// 设置为 en-US
setLocale('en-US')

// 获取当前语言
console.log(getLocale() === 'en-US')


// 渲染一个文字标签
function Example() {
  return <FormattedMessage id="WELCOME_TO_UMI_WORLD" values={{ name: '小伙子' }} />
}
```

