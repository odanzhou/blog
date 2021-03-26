import { useEffect, useState, useRef } from 'react';
import type { ObjectType } from '@/interface'

/**
 * 设置参数
 */
const useParams = < T extends {} = ObjectType, M extends {} = ObjectType>(paramsProps: T | undefined, initParams: M | undefined) => {
  const [params, setParams] = useState(() => ({ ...initParams, ...paramsProps } as M & T));
  const didMountRef = useRef(true);

  useEffect(() => {
    if (didMountRef.current) {
      didMountRef.current = false;
      return;
    }
    setParams((x) => ({ ...x, ...paramsProps }));
  }, [paramsProps]);

  return [params, setParams] as [typeof params, typeof setParams];
};

export default useParams;
