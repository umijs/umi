import { modeColorMap } from '@/contants';
import { state as globalState } from '@/models/global';
import { superLongTextHandle } from '@/utils/g6LongText';
import { IIRoute } from '@/utils/realizeRoutes';
import G6 from '@antv/g6';
import { FC, useEffect } from 'react';
import { useSnapshot } from 'umi';

interface IProps {
  routes: IIRoute[];
  onNodeClick: (id: string) => void;
}

const colorList = [
  {
    color: '#2463eb',
    backgroud: '#dbedff',
  },
  {
    color: '#ec4899',
    backgroud: '#fbe7f3',
  },
  {
    color: '#f97315',
    backgroud: '#ffedd5',
  },
  {
    color: '#8b5cf6',
    backgroud: '#ede9fe',
  },
  {
    color: '#079669',
    backgroud: '#ecfdf5',
  },
];

export const RouteChart: FC<IProps> = ({ routes, onNodeClick }) => {
  const { mode } = useSnapshot(globalState);

  useEffect(() => {
    const { stroke } = modeColorMap[mode];

    const container = document.getElementById('route-container');
    const width = container!.scrollWidth;
    const height = window.innerHeight - 32;

    const graph = new G6.TreeGraph({
      container: 'route-container',
      width,
      height,
      modes: {
        default: ['drag-canvas', 'zoom-canvas'],
      },
      animate: false,
      defaultNode: {
        size: [108, 48],
        type: 'rect',
        style: {
          radius: 5,
          fill: '#dbedff',
          stroke: stroke,
          cursor: 'pointer',
        },
        anchorPoints: [
          [0, 0.5],
          [1, 0.5],
        ],
      },
      defaultEdge: {
        type: 'cubic-horizontal',
        style: {
          stroke: stroke,
          lineDash: [10, 5],
          endArrow: {
            path: 'M 0,0 L 4,2 L 4,-2 Z',
            fill: '#e2e2e2',
          },
        },
      },
      layout: {
        type: 'compactBox',
        direction: 'LR',
        getHeight: () => {
          return 48;
        },
        getWidth: () => {
          return 120;
        },
        getVGap: () => {
          return 10;
        },
        getHGap: () => {
          return 80;
        },
        getSide: () => {
          return 'right';
        },
      },
    });

    graph.node((node) => {
      const { depth, absPath } = node;
      const label = ((absPath as string) || '').split('/').slice(-1)[0] || '/';
      const { color, backgroud } =
        colorList[(depth as number) % colorList.length];

      return {
        style: {
          fill: backgroud,
          stroke: color,
          fontSize: 12,
        },
        label: superLongTextHandle(label, 96, 12),
        labelCfg: {
          position: 'center',
          offset: 5,
          style: {
            fill: color,
            cursor: 'pointer',
          },
        },
      };
    });

    graph.on('node:click', (ev) => {
      const node = ev.item; // 被点击的节点元素
      const id = node!._cfg!.id as string;
      onNodeClick(id);
    });

    graph.data(routes[0] as any);
    graph.render();
    graph.fitCenter();

    // window resize
    const resizeCb = () => {
      const container = document.getElementById('route-container');
      const width = container!.scrollWidth;
      const height = window.innerHeight - 32;
      graph.changeSize(width, height);
    };
    window.addEventListener('resize', resizeCb);
    return () => {
      window.removeEventListener('resize', resizeCb);
    };
  }, [routes, mode]);

  return (
    <div>
      <div id="route-container" />
    </div>
  );
};
