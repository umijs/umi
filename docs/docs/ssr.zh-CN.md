# 服务端渲染（SSR）

> Coming soon...

## Q & A

`Prop `dangerouslySetInnerHTML` did not match.` 报错

只有 `div` 标签 `dangerouslySetInnerHTML` 属性才能被 SSR 渲染，正常的写法应该是：

```diff
- <p dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
+ <div dangerouslySetInnerHTML={{ __html: '<p>Hello</p>' }} />
```
