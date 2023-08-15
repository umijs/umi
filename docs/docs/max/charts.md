# Charts

The Umi team recommends using [Ant Design Charts](https://charts.ant.design/) or [Pro Components](https://procomponents.ant.design/) – both consistent with Ant Design – to add visual charts 📈 to your project.

This tutorial will provide you with some common usage examples.

## Ant Design Charts

Ant Design Charts is the React implementation of the [AntV](https://antv.vision/zh) project, developed by the Ant Group's Data Visualization team.

You can install the complete Ant Design Charts package:

```bash
pnpm install @ant-design/charts
```

Or you can selectively import the sub-packages you need, for example:

```bash
# Install the package for statistical charts
pnpm install @ant-design/plots
```

In the following usage examples, we will minimize the imports.

You can also directly read the comprehensive [Getting Started](https://charts.ant.design/zh/docs/manual/getting-started) and [Gallery](https://charts.ant.design/zh/examples/gallery) of Ant Design Charts.

### Line Chart

Now, we need to present [this data](https://gw.alipayobjects.com/os/bmw-prod/1d565782-dde4-4bb6-8946-ea6a38ccf184.json) as a line chart.

First, import the statistical charts package:

```bash
pnpm install @ant-design/plots
```

Write the code to fetch data (remainder omitted):

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

This way, we retrieve the data and store the contents of the data JSON object in the `data` variable. Each data object looks like:

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

In this case, the `Date` attribute in the data within `data` serves as the X-axis of the line chart, and the `scales` attribute is used as the Y-axis for plotting.

The complete code and result of the line chart can be viewed on [this page](https://charts.ant.design/zh/examples/line/basic#spline).

### Column Chart

Now, we want to display page load times using a column chart.

First, import the statistical charts package:

```bash
pnpm install @ant-design/plots
```

Let's assume we have the following `data`:

```ts
const data = [
  {
    type: '0-1 second',
    value: 0.55
  },
  {
    type: '1-3 seconds',
    value: 0.21
  },
  {
    type: '3-5 seconds',
    value: 0.13
  },
  {
    type: '5+ seconds',
    value: 0.11
  },
];
```

Especially for the `5+ seconds` case, we want to highlight it with a distinct color. You can write the column chart code as follows:

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

The complete code and result of the column chart can be viewed on [this page](https://charts.ant.design/zh/examples/column/basic#color).

### Word Cloud

Now, we want to display the names of some countries in the world as a word cloud. The font size of each country's name in the word cloud should be proportional to its population.

First, import the statistical charts package:

```bash
pnpm install @ant-design/plots
```

Retrieve the data containing country population numbers from this [`data`](https://gw.alipayobjects.com/os/antfincdn/jPKbal7r9r/mock.json). It looks like:

```json
{
  "country": "China",
  "value": 1383220000,
  "category": "asia",
}
```

Render the data and obtain the word cloud:

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

The complete code and result of the word cloud can be viewed on [this page](https://charts.ant.design/zh/examples/more-plots/word-cloud#basic).

### Scatter Map

Now, we want to display the distribution of cities and districts in China as scatter points on a map.

First, import the map package:

```bash
pnpm install @ant-design/maps
```

Retrieve data containing information about all districts from this [`data`](https://gw.alipayobjects.com/os/antfincdn/g5hIthhKlr/quanguoshixianweizhi.json). It looks like:

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

Here, `style` with a value of `0` represents a prefecture-level city, `1` represents a county-level city, and `2` represents a district.

Render the

 data and obtain the scatter map:

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
          value: 'Prefecture-level City',
        },
        {
          color: '#3771D9',
          value: 'County-level City',
        },
        {
          color: '#B8EFE2',
          value: 'District',
        }
      ]
    }
  };

  return <DotMap {...config} />;
};
```

The complete code and result of the scatter map can be viewed on [this page](https://charts.ant.design/zh/examples/map-dot/map-scatter#distribution-cities).

## Pro Components

Pro Components are designed for back-end and middle-tier applications, abstracting Ant Design even further and providing higher-level design specifications. They allow developers to quickly build high-quality pages.

You should selectively import the subpackages you need:

```bash
# Import advanced table
pnpm install @ant-design/pro-table

# Import advanced list
pnpm install @ant-design/pro-list
```

You can also directly read the comprehensive [Getting Started](https://procomponents.ant.design/docs/getting-started), [Table Examples](https://procomponents.ant.design/components/table), and [List Examples](https://procomponents.ant.design/components/list) of Pro Components.

The following examples assume that you have already imported the necessary subpackages.

### Pro Table: Advanced Table

Now, you need to quickly construct a table containing member information and related details.

Member information is as follows:

```ts
const realNames = ['Mababa', 'Zhang Sanfeng', 'Feipeng', 'Xu Changqing'];
const nickNames = ['Baba', 'Junbao', 'Jingtian', 'Xing Xu De'];
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

Process member information and construct an array of `Member`:

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
      title: 'Phone Number',
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

The complete code and result of the table can be viewed on [this page](https://procomponents.ant.design/components/table).

### Pro List: Advanced List

Now, you need to quickly construct a list containing test information.

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
    name: 'Sparrow\'s Sky',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covers all test cases of the login module',
  },
  {
    id: 9904,
    name: 'Ant Design',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covers all test cases, all scenarios have been validated in the Node 17 test environment',
  },
  {
    id: 9905,
    name: 'Ant Group User Experience Technology',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covers all test requirements, all scenarios have been validated in the Ubuntu 14.04 test environment',
  },
  {
    id: 9906,
    name: 'TechUI',
    image:
      'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
    desc: 'Covers all test requirements, all scenarios have been validated in the MacOS test environment',
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
            Add New
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
            <a key="warning">Warning</a>,
            <a key="view">View</a>,
          ],
        },
      }}
    />
  );
}
```

The complete code and result of the list can be viewed on [this page](https://procomponents.ant.design/components/list).
