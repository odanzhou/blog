import { useRef } from 'react';

/**
 * 返回保存最新值的引用
 */
const useNewRef = <T>(val: T) => {
  const valRef = useRef(val);
  valRef.current = val;
  return valRef;
};

export default useNewRef;
