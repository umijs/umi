#### 本example用来验证UMI_DEV_SERVER_COMPRESS环境变量能否正确的打开和关闭dev server的压缩功能:
```
1. 只有在UMI_DEV_SERVER_COMPRESS=none时，dev server才不会开启压缩功能。
2. 其他任何值。包括不设置这个环境变量，都会开启压缩功能。
```
#### 这个feature的意义
```
保证在开发环境时，使用了proxy配置项配置了sse形式的接口时，能够如预期的流式输出，而不是所有event都被阻塞到最后一起输出。
```
#### 本example的验证方式
1. 安装依赖并build pnpm install && pnpm run build
2. 启动sse_server.js文件：这是用来测试效果的sse服务
3. 运行npm run withcompress, 并访问页面。按预期，sse的事件是一次性输出的,效果如下：
![](.\images\withcompress.png)
4. 运行npm run nocompress, 并访问页面。按预期，sse的事件是流式输出的,效果如下：
![](.\images\nocompress.png)
