// 打印组件当前的生命周期
import { useEffect, useRef } from 'react';

/**
 * 打印组件当前的生命周期 create、update、unmount
 */
const useLifecycleLog = () => {
  const isUpdateRef = useRef<undefined | boolean>();
  useEffect(() => {
    console.log('create');
    return () => {
      isUpdateRef.current = false;
      console.log('unmount');
    };
  }, []);

  useEffect(() => {
    if (isUpdateRef.current == null) {
      isUpdateRef.current = true;
    } else if (isUpdateRef.current) {
      console.log('unpdate');
    }
  });
};

export default useLifecycleLog;
