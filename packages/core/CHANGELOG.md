
## unreleased

config

* 配置文件新增支持 .dev 和 .prod 后缀，比如 .umirc.dev.ts 会在 dev 时自动读取

比如声明了 UMI_ENV 为 cloud 时，会读取以下配置文件，并以此覆盖，
1) .umirc.ts
2) .umirc.cloud.ts
3) .umirc.dev.ts
4) .umirc.dev.cloud.ts
5) .umirc.local.ts

* 支持初始没有配置文件，项目启动后新增配置文件的变更触发

service

* 不支持单数目录
* 删除 onPluginReady，统一用 onStart
* 新增 modifyAppData 和 onCheck
* 通用化，移除 umi 元素
