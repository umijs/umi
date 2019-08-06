import * as React from 'react';
import flatten from 'lodash/flatten';

const { useState, useCallback } = React;

const useLoading = (key: string | string[]) => {
  const flatKeys = flatten([key]);
  const getKeysMap = useCallback(() => {
    return flatKeys.reduce(
      (curr, acc) => ({
        ...curr,
        [acc]: false,
      }),
      {},
    );
  }, flatKeys);
  const [keysMap, setKeysMap] = useState<object>(getKeysMap);

  const getLoading = (curKey: string): boolean => {
    return keysMap[curKey] !== false;
  };
  const setLoading = (curKey: string, value: boolean) => {
    setKeysMap(keys => ({
      ...keys,
      [curKey]: value,
    }));
  };

  return { getLoading, setLoading };
};

export default useLoading;
