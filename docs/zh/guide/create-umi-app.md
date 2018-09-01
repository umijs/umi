# 通过脚手架创建项目

umi 通过 [create-umi](https://github.com/umijs/create-umi) 提供脚手架，包含一定的定制化能力。推荐使用 `yarn create` 命令，因为能确保每次使用最新的脚手架。

首先，在新目录下使用 `yarn create umi`，

```bash
$ mkdir myapp && cd myapp
$ yarn create umi
```

然后，选择你需要的功能，功能介绍详见 [plugin/umi-plugin-react](../plugin/umi-plugin-react.html)，

<img src="https://gw.alipayobjects.com/zos/rmsportal/mlEDcowMOSeXwLoukayR.png" />

确定后，会根据你的选择自动创建好目录和文件，

<img src="https://gw.alipayobjects.com/zos/rmsportal/ppRAiFpnZbpwDDuoFdPh.png" width="323" />

然后手动安装依赖，

```bash
$ yarn
```

最后通过 `yarn start` 启动本地开发，

```bash
$ yarn start
```

如果顺利，在浏览器打开 [http://localhost:8000](http://localhost:8000) 可看到以下界面，

<img src="https://gw.alipayobjects.com/zos/rmsportal/YIFycZRnWWeXBGnSoFoT.png" width="754" />
