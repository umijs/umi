import React, { useContext } from 'react';
import TreeSelect, { CustomTreeSelectProps } from '../CustomTreeSelect';
import useCallData from '../hooks/useCallData';
import Context from '../UIApiContext';

const RoutePathTree: React.FC<
  {
    visible: boolean;
  } & CustomTreeSelectProps
> = props => {
  const { api } = useContext(Context);
  const { visible, onChange, ...resetProps } = props;
  /**
   * 这两个在 visible 的时候回重新加载一下
   */
  const { data: pageFoldersTreeData } = useCallData(
    async () => {
      if (visible) {
        return api.callRemote({
          type: 'org.umi.block.routeFiles',
        });
      }
      return pageFoldersTreeData;
    },
    [visible],
    {
      defaultData: [],
    },
  );
  return (
    <TreeSelect
      // index.js -> index
      onChange={value => onChange(value.replace(/(index)?((\.js?)|(\.tsx?)|(\.jsx?))$/, ''))}
      onlySelectLeaf
      treeData={pageFoldersTreeData}
      {...resetProps}
    />
  );
};

export default RoutePathTree;
