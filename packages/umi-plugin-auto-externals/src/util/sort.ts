// 根据 dependenciesTree 对 keys 进行重新排序
function sort(keys: string[], dependenciesTree) {
  const res = [];

  keys.forEach(key => {
    if (res.indexOf(key) > -1) {
      return;
    }
    const { dependencies = [] } = dependenciesTree[key] || [];
    if (dependencies.length === 0) {
      res.push[key];
    }

    dependencies.forEach(dep => {
      if (res.indexOf(dep) > -1) {
        return;
      }
      res.push(dep);
    });
    res.push(key);
  });

  return res;
}

export default sort;
