import type { Edge, Item } from '@antv/g6';
import G6 from '@antv/g6';
import type { Metafile } from '@umijs/bundler-utils/compiled/esbuild';
import { FC, useEffect, useMemo, useRef } from 'react';

interface IProps {
  metaFile: Metafile;
}

const ACTIVE_COLOR = '#117cf3';

export const ViewChart: FC<IProps> = ({ metaFile }) => {
  const selectedNode = useRef<null | Item>(null);

  // 获取图标的 nodes 和 edges
  const G6Data = useMemo(() => {
    const { inputs } = metaFile;
    const files = Object.keys(inputs);
    // 获取 nodes
    const [nodes, filesMap] = files.reduce(
      (acc, file, currentIndex) => {
        const [nodes, filesMap] = acc;
        const id = String(currentIndex);
        // 文件类型对应不同的颜色和 shape
        const fileType = file.split('.').slice(-1)[0];

        let type, color;
        switch (fileType) {
          case 'tsx':
            type = 'circle';
            color = '#BDD2FD';
            break;
          case 'ts':
            type = 'diamond';
            color = '#BDEFDB';
            break;
          case 'js':
            type = 'diamond';
            color = '#FF9D4D';
            break;
          default:
            color = '#FBE5A2';
            type = 'triangle';
        }

        const node = {
          id,
          path: file,
          label: file.split('/').slice(-1)[0],
          type: type,
          style: {
            fill: color,
            stroke: 0,
          },
          stateStyles: {
            selected: {
              fill: ACTIVE_COLOR,
              stroke: 0,
            },
          },
          labelCfg: {
            position: 'bottom',
            style: {
              fill: '#fff',
              shadowColor: 'blue',
              shadowBlur: 10,
            },
          },
        };
        nodes.push(node);
        filesMap[file] = id;
        return [nodes, filesMap];
      },
      [[], {}] as [{ id: string; path: string }[], Record<string, string>],
    );

    // 获取 edges
    // todo: type补充
    const edges = files.reduce((acc: any[], file) => {
      const imports = inputs[file].imports || [];
      const id = filesMap[file];

      const edges = imports
        .filter((ipt) => ipt.original)
        .map(({ path }) => {
          const pId = filesMap[path];
          return {
            source: pId,
            target: id,
            stateStyles: {
              selected: {
                stroke: ACTIVE_COLOR,
                fill: ACTIVE_COLOR,
                shadowBlur: 0,
                endArrow: {
                  stroke: ACTIVE_COLOR,
                  path: 'M 0,0 L 6,3 L 6,-3 Z',
                  fill: ACTIVE_COLOR,
                },
              },
            },
          };
        });

      return [...acc, ...edges];
    }, []);

    return {
      nodes,
      edges,
    };
  }, [metaFile]);

  useEffect(() => {
    const container = document.getElementById('container');
    const width = container!.scrollWidth;
    const height = window.innerHeight - 100;
    const graph = new G6.Graph({
      container: 'container',
      width,
      height,
      fitCenter: true,
      modes: {
        default: ['zoom-canvas', 'drag-canvas', 'drag-node'],
      },
      layout: {
        type: 'forceAtlas2',
        preventOverlap: true,
        kr: 20,
      },
      defaultNode: {
        size: 24,
      },
      animate: true,
      defaultEdge: {
        style: {
          endArrow: {
            path: 'M 0,0 L 4,2 L 4,-2 Z',
            fill: '#e2e2e2',
          },
        },
      },
    });

    // node 切换状态
    const triggerNode = (item: Item, trigger: boolean) => {
      const edges: Edge[] = item._cfg?.edges || [];
      edges.forEach((edge) => {
        graph.setItemState(edge, 'selected', trigger);
      });
      graph.setItemState(item, 'selected', trigger);
    };

    // 不在 node 点击，取消选中
    graph.on('click', (evt) => {
      const type = evt.item?._cfg?.type || null;
      if (type !== 'node' && selectedNode.current) {
        triggerNode(selectedNode.current, false);
      }
    });

    // node 点击事件, 把相关的 node 和 edges 更新状态
    // todo 点击显示 node 详情
    graph.on('node:click', (evt) => {
      const item = evt.item!;
      if (item === selectedNode.current) {
        triggerNode(item, false);
        selectedNode.current = null;
        return;
      }

      if (selectedNode.current) {
        triggerNode(selectedNode.current, false);
      }

      triggerNode(item, true);
      selectedNode.current = item;
    });

    graph.data(G6Data);
    graph.render();

    // window resize
    const resizeCb = () => {
      const container = document.getElementById('container');
      const width = container!.scrollWidth;
      const height = window.innerHeight - 100;
      graph.changeSize(width, height);
    };
    window.addEventListener('resize', resizeCb);
    return () => {
      window.removeEventListener('resize', resizeCb);
      selectedNode.current = null;
      graph.destroy();
    };
  }, [G6Data]);

  return (
    <div>
      <div id="container" />
    </div>
  );
};
