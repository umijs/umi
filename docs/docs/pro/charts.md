# 图表

Umi 团队推荐使用与 Ant Design 一脉相承的 [Ant Design Charts](https://charts.ant.design/) 或 [Pro Components](https://procomponents.ant.design/) 来为您的项目添加可视化图表 📈。

本教程将为您提供一些常见的使用案例。

## Ant Design Charts

Ant Design Charts 是 [AntV](https://antv.vision/zh) 项目的 React 实现，由蚂蚁集团数据可视化团队开发。

您可以安装完整的 Ant Design Charts 包：

```bash
pnpm install @ant-design/charts
```

也可以仅引入使用到的子包，例如：

```bash
# 安装统计图表包
pnpm install @ant-design/plots
```

在下面的使用示例中，我们将最小化引入。

您也可以直接阅读 Ant Design Charts 完整的[上手文档](https://charts.ant.design/zh/docs/manual/getting-started)和[图表示例](https://charts.ant.design/zh/examples/gallery)。

### 曲线图

现在，我们需要将[这些数据](https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json)制作为一个曲线图展示出来。

首先，引入统计图表包：

```bash
pnpm install @ant-design/plots
```

编写代码获取数据（后略）：

```tsx
import { useState, useEffect } from 'react';

const DemoLine = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
};
```

这样，我们获取到了数据，并将数据 JSON 对象的内容保存到 `data` 中去。每个数据对象形如：

```json
{
  "Date": "2010-01",
  "scales": 1998,
}
```

将数据展示到曲线图上：

```tsx
import React from 'react';
import { Line } from '@ant-design/plots';

const DemoLine: React.FC = () => {
  // fetch data

  const config = {
    data,
    padding: 'auto',
    xField: 'Date',
    yField: 'scales',
    xAxis: {
      // type: 'timeCat',
      tickCount: 5,
    },
    smooth: true,
  };

  return <Line {...config} />;
};
```

其中，`data` 中数据的 `Date` 属性将作为曲线图的 X 横坐标，`scales` 属性将作为曲线图的 Y 纵坐标绘图。

完整的曲线图代码和效果可查看[此页面](https://charts.ant.design/zh/examples/line/basic#spline)。

### 柱状图

现在，我们需要把页面加载的时间通过柱状图展示出来。

首先，引入统计图表包：

```bash
pnpm install @ant-design/plots
```

假设我们有如下 `data`：

```ts
const data = [
  {
    type: '0-1 秒',
    value: 0.55,
  },
  {
    type: '1-3 秒',
    value: 0.21,
  },
  {
    type: '3-5 秒',
    value: 0.13,
  },
  {
    type: '5+ 秒',
    value: 0.11,
  },
];
```

特别的，对于 `5+ 秒` 的情况，我们想要用鲜明的颜色标注出来。那么可以编写柱状图代码如下：

```tsx
import React from 'react';
import { Column } from '@ant-design/plots';

const DemoColumn: React.FC = () => {
  // fetch data

  const paletteSemanticRed = '#F4664A';
  const brandColor = '#5B8FF9';
  const config = {
    data,
    xField: 'type',
    yField: 'value',
    seriesField: '',
    color: ({ type }) => {
      if (type === '5+ 秒') {
        return paletteSemanticRed;
      }

      return brandColor;
    },
    legend: false,
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
  };

  return <Column {...config} />;
};
```

完整的柱状图代码和效果可查看[此页面](https://charts.ant.design/zh/examples/column/basic#color)。

### 词云

现在，我们需要把世界上部分国家的名字以词云的方式展示出来。国家的人数越多，词云上国家的名字字体越大。

首先，引入统计图表包：

```bash
pnpm install @ant-design/plots
```

获取包含国家人口数量的 [`data`](https://gw.alipayobjects.com/os/antfincdn/jPKbal7r9r/mock.json)。形如：

```json
{
  "country": "China",
  "value": 1383220000,
  "category": "asia",
}
```

渲染数据，获得词云图：

```tsx
import React from 'react';
import { WordCloud } from '@ant-design/plots';

const DemoWordCloud: React.FC = () => {
  // fetch data

  const config = {
    data,
    wordField: 'country',
    weightField: 'value',
    color: '#122c6a',
    interactions: [
      {
        type: 'element-active',
      },
    ],
    state: {
      active: {
        style: {
          lineWidth: 2,
        },
      },
    },
  };

  return <WordCloud {...config} />;
};
```

完整的词云图代码和效果可查看[此页面](https://charts.ant.design/zh/examples/more-plots/word-cloud#basic)。

### 散点地图

现在，我们需要将我国城市和区县分布在地图上以散点的形式展示出来。

首先，引入地图包：

```bash
pnpm install @ant-design/maps
```

获取包含所有区县数据的 [`data`](https://gw.alipayobjects.com/os/antfincdn/g5hIthhKlr/quanguoshixianweizhi.json)。形如：

```json
{
  "list": [
    {
      "lnglat": [
        116.258446,
        37.686622
      ],
      "name": "景县",
      "style": 2
    },
    // ...
  ]
}
```

其中，`style` 为 `0` 表示为地级市，`1` 表示为县城市，`2` 表示为区县。

渲染数据，获得散点地图：

```tsx
import React from 'react';
import { DotMap } from '@ant-design/maps';

const DemoDotMap: React.FC = () => {
  // fetch data

  const config = {
    map: {
      type: 'mapbox',
      style: 'dark',
      zoom: 3,
      center: [107.4976, 32.1697],
      pitch: 0,
    },
    source: {
      data,
      parser: {
        type: 'json',
        coordinates: 'lnglat',
      },
    },
    size: 4,
    color: {
      field: 'style',
      value: ({ style }) => {
        if (style == 0) {
          return '#14B4C9';
        } else if (style == 1) {
          return '#3771D9';
        } else {
          return '#B8EFE2';
        }
      },
    },
    legend: {
      type: 'category',
      position: 'bottomleft',
      items: [
        {
          color: '#14B4C9',
          value: '地级市',
        },
        {
          color: '#3771D9',
          value: '县城市',
        },
        {
          color: '#B8EFE2',
          value: '区县',
        },
      ],
    },
  };

  return <DotMap {...config} />;
};
```

完整的散点地图代码和效果可查看[此页面](https://charts.ant.design/zh/examples/map-dot/map-scatter#distribution-cities)。

## Pro Components

Pro Components 面向中后台类应用，对 Ant Design 进行了更高程度的抽象，提供了更上层的设计规范，能够助开发者快速搭建出高质量的页面。

您应当按需引入使用到的子包：

```bash
# 引入高级表格
pnpm install @ant-design/pro-table

# 引入高级列表
pnpm install @ant-design/pro-list
```

您也可以直接阅读 Pro Components 完整的[上手文档](https://procomponents.ant.design/docs/getting-started)，[表格示例](https://procomponents.ant.design/components/table)和[列表示例](https://procomponents.ant.design/components/list)。

下面的示例中将默认您已经引入了使用到的子包。

### Pro Table 高级表格

现在，您需要快速构建一个包含有成员和相关信息的表格。

成员信息如下：

```ts
const realNames = ['马巴巴', '张三丰', '飞蓬', '徐长卿'];
const nickNames = ['巴巴', '君宝', '景天', '姓徐的'];
const emails = ['baba@antfin.com', 'junbao@antfin.com', 'jingtian@antfin.com', 'xvzhangmen@antfin.com'];
const phones = ['18800001234', '13900002345', '17200003456', '17800004567'];
```

定义一个 `Member` 类型：

```ts
export type Member = {
  id: number;
  realName: string;
  nickName: string;
  email: string;
  phone: string;
};
```

处理成员信息，构建一个 `Member` 数组：

```ts
const memberList: Member[] = [];

for (let i = 0; i < realNames.length; i++) {
  memberList.push({
    id: `${102047 + i}`,
    realName: realNames[i],
    nickName: nickNames[i],
    email: emails[i],
    phone: phones[i],
  });
}
```

将数组传递给 Pro Table，快速构建表格：

```tsx
import React from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

// resolve member info list

const MemberList: React.FC = () => {
  const columns: ProColumns<Member>[] = [
    {
      dataIndex: 'realName',
      title: '姓名',
    },
    {
      dataIndex: 'nickName',
      title: '昵称',
    },
    {
      dataIndex: 'email',
      title: '账号',
    },
    {
      dataIndex: 'phone',
      title: '手机号',
    },
    {
      title: '操作',
      dataIndex: 'x',
      valueType: 'option',
      render: (_, record) => {
        return [<a key="edit">编辑</a>, <a key="remove">移除</a>];
      },
    },
  ];

  return (
    <ProTable<Member>
      columns={columns}
      request={(params, sorter, filter) => {
        console.log(params, sorter, filter);
        return Promise.resolve({
          data: memberList,
          success: true,
        });
      }}
      rowKey="id"
      pagination={{
        showQuickJumper: true,
      }}
      toolBarRender={false}
      search={false}
    />
  );
}
```

完整的表格代码和效果可查看[此页面](https://procomponents.ant.design/components/table)。

### Pro List 高级列表

现在，您需要快速构建一个包含测试信息的列表。

测试信息如下：

```ts
export type Test = {
  id: number;
  name: string;
  image: string;
  desc: string;
};

const testList: Test[] = [
  {
    id: 9903,
    name: '语雀的天空',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: '覆盖了登录模块的所有测试用例',
  },
  {
    id: 9904,
    name: 'Ant Design',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: '覆盖了所有测试用例，所有的案例均已在 Node 17 测试环境验证完成',
  },
  {
    id: 9905,
    name: '蚂蚁金服体验科技',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: '覆盖了所有测试需求，所有的案例均已在 Ubuntu 14.04 测试环境验证完成',
  },
  {
    id: 9906,
    name: 'TechUI',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: '覆盖了所有测试需求，所有的案例均已在 MacOS 测试环境验证完成',
  },
];
```

将测试信息传递给 Pro List，快速构建列表：

```tsx
import React from 'react';
import { Button } from 'antd';
import ProList from '@ant-design/pro-list';

// resolve test info list

const MemberList: React.FC = () => {
  return (
    <ProList<any>
      toolBarRender={() => {
        return [
          <Button key="add" type="primary">
            新建
          </Button>,
        ];
      }}
      rowKey="id"
      headerTitle="测试结果"
      dataSource={testList}
      showActions="hover"
      showExtra="hover"
      metas={{
        title: {
          dataIndex: 'name',
        },
        avatar: {
          dataIndex: 'image',
        },
        description: {
          dataIndex: 'desc',
        },
        actions: {
          render: (text, row) => [
            <a key="link">链路</a>,
            <a key="warning">报警</a>,
            <a key="view">查看</a>,
          ],
        },
      }}
    />
  );
}
```

完整的列表代码和效果可查看[此页面](https://procomponents.ant.design/components/list)。
