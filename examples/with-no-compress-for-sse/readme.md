# with-no-compress-for-sse

### 背景

[来源](https://github.com/umijs/umi/issues/12144)，在开发环境下由于 umi dev server 内置了 `compress` 中间件，导致 SSE 流在开发时传递不符合预期。

### 解决

本示例演示了此问题，并通过启动时附加 `UMI_DEV_SERVER_COMPRESS=none` 来关闭 `compress` 中间件，使 SSE 在本地开发时正常运作。
