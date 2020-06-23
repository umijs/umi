# 贡献

## 贡献 Umi Core 代码

参考 Umi 的 [CONTRIBUTING 文档](https://github.com/umijs/umi/blob/master/CONTRIBUTING.md)。

## 贡献 Umi 官方插件

参考 Umi Plugins 的 [CONTRIBUTING 文档](https://github.com/umijs/plugins/blob/master/CONTRIBUTING.md)。

## 如何调试 Umi 代码

在 umi 代码中加上 `debugger`，然后执行以下命令（确保先执行过 `yarn build -w` 将源码编译）

```bash
# 调试 umi dev
$ yarn debug examples/normal dev

# 调试 umi build
$ yarn debug examples/normal build
```

![image](https://user-images.githubusercontent.com/13595509/82630300-e56b6d80-9c24-11ea-9966-5e9f38889518.png)

**注意**：提交代码前记得将 `debugger` 删除。

## 贡献文档

Umi 使用 Umi 本身 + dumi 插件作为文档工具，

1. 每篇文档左下方有 “在 GitHub 上编辑这篇文档”，你可以通过这里进行文档修改
2. 打开 [Github 上的 docs](https://github.com/umijs/umi/tree/master/docs) 目录，用文件编辑器新建、修改、预览文件，然后提 PR
3. 你还可以 clone [Umi 仓库](https://github.com/umijs/umi)，修改 docs 目录下的文件，本地文档调试完成后统一提 PR

