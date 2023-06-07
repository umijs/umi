import { IAppData, IRoute } from '@/hooks/useAppData';

type PartialIRoute = Partial<IRoute>;
export interface IIRoute extends PartialIRoute {
  children: IIRoute[];
}

export const FAKE_ID = '__FAKE_LAYOUT__';

// 通过对象引用建立route间关系
export const realizeRoutes = (routes: IAppData['routes']): IIRoute[] => {
  const ids = Object.keys(routes);
  const relations: IIRoute[] = [];
  // 临时储存关系
  const temporary: Record<string, IIRoute> = {};
  ids.forEach((id) => {
    const route = routes[id];
    const { parentId } = route;
    // 初始父代
    if (!parentId) {
      if (!temporary[id]) {
        temporary[id] = {
          ...route,
          children: [],
        };
        relations.push(temporary[id]);
        return;
      }
      relations.push({
        ...temporary[id],
        ...route,
      });
      return;
    }

    // 子集
    if (!temporary[id]) {
      temporary[id] = {
        ...route,
        children: [],
      };
    }
    if (temporary[parentId]) {
      temporary[parentId].children.push(temporary[id]);
      return;
    }
    temporary[parentId] = {
      id: parentId,
      children: [temporary[id]],
    };
  });

  // 没有layout
  if (relations.length > 1) {
    return [
      {
        id: FAKE_ID,
        path: '',
        absPath: '',
        isLayout: true,
        children: relations,
      },
    ];
  }
  return relations;
};
