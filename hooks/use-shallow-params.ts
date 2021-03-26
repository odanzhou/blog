import { useRef, useMemo } from 'react';
import type { ObjectType } from '@/interface'

/**
 * 对对象进行浅比较，发生变化后才返回新的参数
 * {x: 1} 与 {x: 1} 相同，{x: {y: 1}} 与 {x: {y: 1}} 不同, {x: any} 与 {x: any} 相同
 * @param params 对象参数
 */
const useShallowParams = <T extends ObjectType>(params: T) => {
  const paramsRef = useRef(params);
  useMemo(() => {
    const { current: refCurrent } = paramsRef;
    if (params !== refCurrent) {
      const oldKeys = Object.keys(refCurrent);
      const keys = Object.keys(params);
      if (
        oldKeys.length !== keys.length ||
        !keys.every((key) => oldKeys.includes(key) && Object.is(refCurrent[key], params[key]))
      ) {
        paramsRef.current = params;
      }
    }
  }, [params]);
  return paramsRef.current;
};

export default useShallowParams;
