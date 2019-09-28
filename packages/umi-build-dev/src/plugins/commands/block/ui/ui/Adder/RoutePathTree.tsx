import React, { useContext } from 'react';
import TreeSelect, { TreeSelectProps } from '../TreeSelect';
import useCallData from '../hooks/useCallData';
import Context from '../UIApiContext';

const RoutePathTree: React.FC<
  {
    visible: boolean;
  } & TreeSelectProps
> = props => {
  const { api } = useContext(Context);
  /**
   * 这两个在 visible 的时候回重新加载一下
   */
  const { data: routePathTreeData } = useCallData(
    async () => {
      if (props.visible) {
        return api.callRemote({
          type: 'org.umi.block.routes',
        });
      }
      return routePathTreeData;
    },
    [props.visible],
    {
      defaultData: [],
    },
  );

  return (
    <TreeSelect
      placeholder="请选择路由"
      filterPlaceholder="筛选路由"
      selectable
      treeData={routePathTreeData}
      {...props}
    />
  );
};

export default RoutePathTree;
