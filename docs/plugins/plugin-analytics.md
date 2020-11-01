---
translateHelp: true
---

# @umijs/plugin-analytics


Analytics for [Baidu Tongji](https://tongji.baidu.com/) and [Google Analytics](https://analytics.google.com/analytics/web/).

## How to enable

Configuration is enabled.

## Configuration

such as:

```javascript
export default {
  analytics: {
    ga: 'google analytics code',
    baidu: '5a66cxxxxxxxxxx9e13',
  },
}
```

### ga

Google statistics code.

### baidu

Baidu statistics code.

For example, `hm.src = "https://hm.baidu.com/hm.js?5a66c03cxxxxxx554f2b9e13";`, then `5a66c03cxxxxxx554f2b9e13` should be configured here.

## Baidu Event Tracking

> Call the event tracking code in JS. `window._hmt.push(['_trackEvent', category, action, opt_label, opt_value]);`

| Parameters | Description |
| :-- | :-: |
| category | The type name of the target to be monitored, usually the name of the same group of targets, such as "video", "music", "software", "game" and so on. This item is required. Events that are not filled or filled with "-" will be discarded. |
| action | The behavior of the user interacting with the target, such as "play", "pause", "download", etc. This item is required. Events that are left blank or filled with "-" will be discarded. |
| opt_label | Some additional information about the event, usually the name of the song, the name of the software, the name of the link, etc. This item is optional, if it is not filled, or "-" means this item is empty. |
| opt_value | Some numerical information of the event, such as weight, duration, price, etc. You can see the average value and other data in the report. This item is optional. |
