---
order: 4
toc: content
translated_at: '2024-03-17T09:39:12.613Z'
---

# Charts

The Umi team recommends using [Ant Design Charts](https://charts.ant.design/) or [Pro Components](https://procomponents.ant.design/) in line with Ant Design to add visualization charts 📈 to your project.

This tutorial will provide you with some common use cases.

## Ant Design Charts

Ant Design Charts is a React implementation of the [AntV](https://antv.vision/en) project, developed by the data visualization team of Ant Group.

You can install the complete Ant Design Charts package:

```bash
pnpm install @ant-design/charts
```

You can also just include the sub-packages you use, for example:

```bash
# Install statistical chart package
pnpm install @ant-design/plots
```

In the example usage below, we will keep imports to a minimum.

You can also directly read the complete [Getting Started documentation](https://charts.ant.design/en/docs/manual/getting-started) and [Chart Examples](https://charts.ant.design/en/examples/gallery) of Ant Design Charts.

### Line Chart

Now, we need to create a line chart to display [these data](https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json).

First, include the statistical chart package:

```bash
pnpm install @ant-design/plots
```

Write code to fetch the data (omitted below):

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

Thus, we have obtained the data and saved the JSON object's content to `data`. Each data object is like:

```json
{
  "Date": "2010-01",
  "scales": 1998,
}
```

Display the data on the line chart:

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

In this, the `Date` attribute in `data` will serve as the X-axis horizontal axis of the line chart, and the `scales` attribute will serve as the Y-axis vertical axis for drawing.

The complete line chart code and effect can be viewed on [this page](https://charts.ant.design/en/examples/line/basic#spline).

### Column Chart

Now, we need to display the page load time through a column chart.

First, include the statistical chart package:

```bash
pnpm install @ant-design/plots
```

Suppose we have the following `data`:

```ts
const data = [
  {
    type: '0-1 seconds',
    value: 0.55,
  },
  {
    type: '1-3 seconds',
    value: 0.21,
  },
  {
    type: '3-5 seconds',
    value: 0.13,
  },
  {
    type: '5+ seconds',
    value: 0.11,
  },
];
```

Especially, for the case of `5+ seconds`, we want to mark it with a bright color. Then we can write the column chart code as follows:

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
      if (type === '5+ seconds') {
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

The complete column chart code and effect can be viewed on [this page](https://charts.ant.design/en/examples/column/basic#color).

### Word Cloud

Now, we need to display the names of some countries in the world in a word cloud manner. The more populous the country, the larger the font size of its name in the word cloud.

First, include the statistical chart package:

```bash
pnpm install @ant-design/plots
```

Get the [`data`](https://gw.alipayobjects.com/os/antfincdn/jPKbal7r9r/mock.json) containing country population figures. It looks like:

```json
{
  "country": "China",
  "value": 1383220000,
  "category": "asia",
}
```

Render the data to get the word cloud:

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

The complete word cloud code and effect can be viewed on [this page](https://charts.ant.design/en/examples/more-plots/word-cloud#basic).

### Dot Map

Now, we need to display the distribution of cities and districts in our country on the map in the form of dots.

First, include the map package:

```bash
pnpm install @ant-design/maps
```

Get the [`data`](https://gw.alipayobjects.com/os/antfincdn/g5hIthhKlr/quanguoshixianweizhi.json) containing all district data. It looks like:

```json
{
  "list": [
    {
      "lnglat": [
        116.258446,
        37.686622
      ],
      "name": "Jing County",
      "style": 2
    },
    // ...
  ]
}
```

Where, `style` of `0` stands for municipal city, `1` for county-level city, and `2` for district.

Render the data to get the dot map:

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
          value: 'Municipal city',
        },
        {
          color: '#3771D9',
          value: 'County-level city',
        },
        {
          color: '#B8EFE2',
          value: 'District',
        },
      ],
    },
  };

  return <DotMap {...config} />;
};
```

The complete dot map code and effect can be viewed on [this page](https://charts.ant.design/en/examples/map-dot/map-scatter#distribution-cities).

## Pro Components

Pro Components are aimed at mid-to-background applications, offering a higher degree of abstraction on top of Ant Design, providing a higher-level design specification to help developers quickly build high-quality pages.

You should import the sub-packages you use as needed:

```bash
# Import advanced table
pnpm install @ant-design/pro-table

# Import advanced list
pnpm install @ant-design/pro-list
```

You can also directly read Pro Components' complete [Getting Started documentation](https://procomponents.ant.design/docs/getting-started), [Table Examples](https://procomponents.ant.design/components/table) and [List Examples](https://procomponents.ant.design/components/list).

The examples below will assume you have already imported the sub-packages you will use.

### Pro Table Advanced Table

Now, you need to quickly build a table containing members and related information.

Member information is as follows:

```ts
const realNames = ['Ma Baba', 'Zhang Sanfeng', 'Fei Peng', 'Xu Changqing'];
const nickNames = ['Baba', 'Junbao', 'Jingtian', 'Mr. Xu'];
const emails = ['baba@antfin.com', 'junbao@antfin.com', 'jingtian@antfin.com', 'xvzhangmen@antfin.com'];
const phones = ['18800001234', '13900002345', '17200003456', '17800004567'];
```

Define a `Member` type:

```ts
export type Member = {
  id: number;
  realName: string;
  nickName: string;
  email: string;
  phone: string;
};
```

Process member information to build a `Member` array:

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

Pass the array to Pro Table to quickly build the table:

```tsx
import React from 'react';
import type { ProColumns } from '@ant-design/pro-table';
import ProTable from '@ant-design/pro-table';

// resolve member info list

const MemberList: React.FC = () => {
  const columns: ProColumns<Member>[] = [
    {
      dataIndex: 'realName',
      title: 'Name',
    },
    {
      dataIndex: 'nickName',
      title: 'Nickname',
    },
    {
      dataIndex: 'email',
      title: 'Account',
    },
    {
      dataIndex: 'phone',
      title: 'Phone number',
    },
    {
      title: 'Action',
      dataIndex: 'x',
      valueType: 'option',
      render: (_, record) => {
        return [<a key="edit">Edit</a>, <a key="remove">Remove</a>];
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

The complete table code and effect can be viewed on [this page](https://procomponents.ant.design/components/table).

### Pro List Advanced List

Now, you need to quickly build a list containing test information.

Test information is as follows:

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
    name: 'Yuque\'s Sky',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covered all test cases for the login module',
  },
  {
    id: 9904,
    name: 'Ant Design',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covered all test cases, all scenarios have been verified under the Node 17 testing environment',
  },
  {
    id: 9905,
    name: 'Ant Group Experience Technology',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covered all testing requirements, all scenarios have been verified under the Ubuntu 14.04 testing environment',
  },
  {
    id: 9906,
    name: 'TechUI',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covered all testing requirements, all scenarios have been verified under MacOS testing environment',
  },
];
```

Pass the test information to Pro List to quickly build the list:

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
            New
          </Button>,
        ];
      }}
      rowKey="id"
      headerTitle="Test Results"
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
            <a key="link">Link</a>,
            <a key="warning">Alert</a>,
            <a key="view">View</a>,
          ],
        },
      }}
    />
  );
}
```

The complete list code and effect can be viewed on [this page](https://procomponents.ant.design/components/list).
