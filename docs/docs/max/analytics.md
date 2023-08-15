# Website Analytics

`@umijs/max` comes with built-in website analytics functionality, currently supporting [Google Analytics](https://analytics.google.com/analytics/web/) and [Baidu Tongji](https://tongji.baidu.com/web/welcome/login).

## Activation

Enable analytics by configuring it and providing the corresponding tracking keys as needed.

For example:

```ts
{
  analytics: {
    ga_v2: 'G-abcdefg', // Google Analytics key (GA 4)
    baidu: 'baidu_tongji_key',

    // If you are using the older GA v1 version, use `ga` to configure
    ga: 'ga_old_key'
  }
}
```

### Environment Variables

You can also configure the key for [Google Analytics 4](https://support.google.com/analytics/answer/10089681) using the environment variable `GA_V2_KEY`, and for the older version, you can use `GA_KEY`.