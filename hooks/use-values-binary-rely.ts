/* eslint-disable react-hooks/exhaustive-deps */
// 二维数组中多个key都变化了再变化(values 之间有依赖)
import { useRef, useMemo } from 'react';
import { changeListIndex } from '@/utils/utils';

/**
 * 批量处理数据依赖问题
 * 二维数组中多个key都变化了再变化(values 之间有依赖)
 * values 二维数组，不需要保持数组稳定，但长度需要一致（一维长度稳定，每个一维的下标数组保持稳定），如：[['a', 'b', 'c'], [1,2,3]]
 * @param {ReadonlyArray<React.DependencyList>} valuesBinaryArray
 */
const useValuesBinaryRely = (valuesBinaryArray: readonly React.DependencyList[]) => {
  const valuesRef = useRef(valuesBinaryArray as React.DependencyList[]);
  const countRef = useRef(Array.from({ length: valuesBinaryArray.length }, () => 0));

  const newValuesRef = useRef(valuesBinaryArray);
  newValuesRef.current = valuesBinaryArray;

  const count = useMemo(() => {
    const list = newValuesRef.current;
    for (let index = 0; index < list.length; ) {
      const oldList = valuesRef.current[index];
      const newList = list[index];
      // 值都不相等
      if (oldList.every((val, i) => !Object.is(val, newList[i]))) {
        countRef.current = changeListIndex(countRef.current, index, countRef.current[index] + 1);
        valuesRef.current = changeListIndex(valuesRef.current, index, newList);
      }
      index += 1;
    }
    return countRef.current;
  }, valuesBinaryArray);

  return {
    count,
  };
};

export default useValuesBinaryRely;
