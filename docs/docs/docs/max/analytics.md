---
order: 14
toc: content
---
# 站点统计

`@umijs/max` 内置了站点统计的功能，目前支持 [Google Analytics](https://analytics.google.com/analytics/web/) 和[百度统计](https://tongji.baidu.com/web/welcome/login)

## 启用方式

配置开启，按照需求配置进对应的统计服务的 key 即可。

举例：

```ts
{
  analytics: {
    ga_v2: 'G-abcdefg', // google analytics 的 key (GA 4)
    baidu: 'baidu_tongji_key',

    // 若你在使用 GA v1 旧版本，请使用 `ga` 来配置
    ga: 'ga_old_key'
  }
}
```

### 环境变量

[Google Analytics 4](https://support.google.com/analytics/answer/10089681) 的 key 也可以通过环境变量 `GA_V2_KEY` 来配置，旧版本为 `GA_KEY` 。
