---
order: 14
toc: content
translated_at: '2024-03-17T09:48:57.403Z'
---

# Site Statistics

`@umijs/max` has built-in site statistics functionality, currently supporting [Google Analytics](https://analytics.google.com/analytics/web/) and [Baidu Analytics](https://tongji.baidu.com/web/welcome/login)

## How to Enable

Configure it to be enabled and enter the respective analytics service key as required.

Example:

```ts
{
  analytics: {
    ga_v2: 'G-abcdefg', // google analytics key (GA 4)
    baidu: 'baidu_tongji_key',

    // If you are using the old version GA v1, please use `ga` to configure
    ga: 'ga_old_key'
  }
}
```

### Environment Variables

The key for [Google Analytics 4](https://support.google.com/analytics/answer/10089681) can also be configured through the environment variable `GA_V2_KEY`, and the old version uses `GA_KEY`.
