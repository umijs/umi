import { Message } from 'umi'

# MFSU

## 什么是 MFSU

MFSU 是一种基于 webpack5 新特性 Module Federation 的打包提速方案。其核心的思路是通过分而治之，将应用源代码的编译和应用依赖的编译分离，将变动较小的应用依赖构建为一个 Module Federation 的 remote 应用，以免去应用热更新时对依赖的编译。

开启 MFSU 可以大幅减少热更新所需的时间了；因此我们在 Umi 的项目中默认开启了 MFSU 功能。当然你也可以通过配置 `mfsu: false` 来关闭它。

## MFSU 的两种策略

MFSU 最关键的一点是如何将应用代码的实际使用的依赖分析出来。根据不同的分析方式 MFSU 有两种工作方式。

### normal 策略 (编译时分析)

采用以下配置启用

```ts {2}
mfsu: {
  strategy: 'normal',
}
```

现代前端项目的中的都需要经过转译(transpile)，才会在生产环境中使用。在转译的过程中转译器(比如：babel) 就会在代码中插入新的依赖。这些插入的依赖在项目代码层面是不可见， 但通过转译的插件才收集到。

MFSU 编译时分析的工作方式，先对应用项目源码单独进行编译，编译的同时收集项目的本身依赖和编译引入的依赖。待项目代码编译完成以后，使用收集到的结果继续进行项目依赖部分的代码的构建。

从下图中以 React 引用的构建举例可以看出，整个过程是串行的。

![normal-proccess](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*VRdhQZDag1UAAAAAAAAAAAAAARQnAQ)

### eager 策略 (扫描方式)

```ts {2}
mfsu: {
  strategy: 'eager',
}
```

和编译时分析的方式不同，扫描分析的方式会先读取项目中的所有源代码文件，然后通过静态分析的方式获取项目的依赖。这个过程非常的快，在一个有 17 万行代码，1400 多个文件项目中，分析一次只需要 700ms 左右。如此快速的分析的代价时，收集到的依赖会缺失后面项目代码编译插入的依赖；这部分的依赖最终和项目代码一起编译打包。

分析完项目依赖之后，Umi 会拿着这份依赖信息，并行的去进行项目代码的编译和依赖的编译。

从下图可以看出，编译部分是并行。

![eager-proccess](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*XtZ1Spa9hMEAAAAAAAAAAAAAARQnAQ)

## 如何选择

**编译时分析**的好处是收集的依赖是完整的，项目代码和依赖代码的构建打包完全分离；再项目代码修改以后只需要构建项目代码部分。缺点也很明显，构建的过程是串行的。

**扫描的方式**的优点在于耗时的代码构建都是并行的，对于较大项目的冷启动时间改善非常明显。缺点则是有一部分运行时依赖会和项目代码一起编译。

基于优缺点的分析，给出以下建议

- 如果你的项目较大，项目代码基数较大，推荐使用 "eager" 策略
- 如果项目刚刚启动，会频繁的改动依赖，推荐使用 "eager" 策略
- 其他类型的项目则随意选择。

## 常见问题

### 依赖缺失

```bash /lodash.capitalize/
error - [MFSU][eager] build worker failed AssertionError [ERR_ASSERTION]: filePath not found of lodash.capitalize
```

检查你的依赖确保，对应的依赖已经安装。( 如例子中的 `lodash.capitalize`)

### React 多实例问题

在浏览器中有如下报错

![multi-react-instance](https://gw.alipayobjects.com/mdn/rms_ffea06/afts/img/A*ScIJTZobWE4AAAAAAAAAAAAAARQnAQ)

根因在某些复杂场景下，React 的代码被打包多份，再运行时产出了多个 React 实例。解法通过 Module Feratation 的 `shared` 配置来避免多实例的出现。
如果有其他依赖出现多实例的问题，可以通过类似的方式解决。

```ts {3-5}
mfsu: {
  shared: {
    react: {
      singleton: true,
    },
  },
},
```
<Message emoji="⚠️" >
如果开启了 [MF插件](../max/mf), 需要开启 `shared`，请[参考](../max/mf#和-mfsu-一起使用)。
</Message>	
