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
  const { data: pageFoldersTreeData } = useCallData(
    async () => {
      if (props.visible) {
        return api.callRemote({
          type: 'org.umi.block.pageFiles',
        });
      }
      return pageFoldersTreeData;
    },
    [props.visible],
    {
      defaultData: [],
    },
  );
  return (
    <TreeSelect
      placeholder="选择安装文件路径"
      filterPlaceholder="筛选安装文件路径"
      selectable
      onlySelectLeaf
      treeData={pageFoldersTreeData}
      {...props}
    />
  );
};

export default RoutePathTree;
