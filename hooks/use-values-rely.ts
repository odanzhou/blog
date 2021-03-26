/* eslint-disable react-hooks/exhaustive-deps */
// 多个key都变化了再变化(values 之间有依赖)
import { useRef, useMemo } from 'react';

/**
 * 多个key都变化了再变化(values 之间有依赖)
 * values 数组，不需要保持数组稳定，但长度需要一致，如 ['a', 'b', 'c']
 */
const useValuesRely = (values: React.DependencyList) => {
  const valuesRef = useRef(values);
  const countRef = useRef(0);

  const newValuesRef = useRef(values);
  newValuesRef.current = values;

  const count = useMemo(() => {
    const list = newValuesRef.current;
    // 值都不相等
    if (valuesRef.current.every((val, i) => !Object.is(val, list[i]))) {
      countRef.current += 1;
      valuesRef.current = newValuesRef.current
    }
    return countRef.current;
  }, values);

  return {
    count,
  };
};

export default useValuesRely;
