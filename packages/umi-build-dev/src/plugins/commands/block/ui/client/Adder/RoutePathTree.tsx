import React, { useContext } from 'react';
import TreeSelect, { CustomTreeSelectProps } from '../CustomTreeSelect';
import useCallData from '../hooks/useCallData';
import Context from '../UIApiContext';

const RoutePathTree: React.FC<
  {
    visible: boolean;
  } & CustomTreeSelectProps
> = props => {
  const { visible, ...resetProps } = props;
  const { api } = useContext(Context);
  /**
   * 这两个在 visible 的时候回重新加载一下
   */
  const { data: routePathTreeData } = useCallData(
    async () => {
      if (visible) {
        return api.callRemote({
          type: 'org.umi.block.routes',
        });
      }
      return routePathTreeData;
    },
    [visible],
    {
      defaultData: [],
    },
  );

  return <TreeSelect treeData={routePathTreeData} {...resetProps} />;
};

export default RoutePathTree;
