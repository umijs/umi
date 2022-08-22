import { Message, Tabbed } from 'umi';

# moment2dayjs 插件

因为 moment [进入维护状态](https://momentjs.com/docs/#/-project-status/)，再加上 moment 包的尺寸过大并且不支持 tree-shaking。将项目中的 moment 替换为 dayjs (尺寸仅 2k)，是一个推荐的优化选择。但是如果手动修改效率太低。

Max 内置 `moment2dayjs` 通过 alias 的方式替换项目所有的 `moment` 的引用为 `dayjs`。

# 配置

<Tabbed>

Max 项目

```ts
// .umirc.ts
moment2dayjs: {
  preset: 'antd',
  plugins: ['duration'],
}
```

Umi 项目

```ts
// .umirc.ts
plugins: [ '@umijs/plugins/dist/moment2dayjs' ],
moment2dayjs: {
  preset: 'antd' ,
  plugins: ['duration'],
}
```

</Tabbed>

## preset

preset 可配置的值：`antd|antdv3|none`

preset 为 `antd` dayjs 扩展以下插件：

- isSameOrBefore
- isSameOrAfter
- advancedFormat
- customParseFormat
- weekday
- weekYear
- weekOfYear
- isMoment
- localeData
- localizedFormat

preset 为 `antdv3` dayjs 扩展以下插件：

- isSameOrBefore
- isSameOrAfter
- advancedFormat
- customParseFormat
- weekday
- weekYear
- weekOfYear
- isMoment
- localeData
- localizedFormat
- badMutable

preset 为 `none` 不扩展任何插件。

## plugins

手动配置的 `dayjs` 插件名列表。

<Message emoji="🚨" >
preset 的插件和 plugins 配置的插件会合并后配置到 dayjs
</Message>

<Message emoji="🚨" >
开启该插件后，需要自行安装 `dayjs` 依赖
</Message>
