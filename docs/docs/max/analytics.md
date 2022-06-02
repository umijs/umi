# 站点统计

`@umijs/max` 内置了站点统计的功能，目前支持 [Google Analytics](https://analytics.google.com/analytics/web/) 和[百度统计](https://tongji.baidu.com/web/welcome/login)

## 启用方式

配置开启，按照需求配置进对应的统计服务的 key 即可。

举例：

```ts
{
	analytics:{
		ga: 'ga_key', // google analytics 的 key
		baidu: 'baidu_tongji_key'
	}
}
```

Google Analytics 的 key 也可以通过环境变量 `GA_KEY` 来配置。
