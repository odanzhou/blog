// https://developer.mozilla.org/zh-CN/docs/Web/API/Document/hidden
import { useCallback, useEffect } from 'react';
import useNewRef from './use-new-ref';

type PageActiveParams = {
  onPageVisibilityChange: (hidden: boolean) => void;
  hideDelayTime?: number; // 隐藏触发时延迟执行时间
};

const usePageVisibilityChange = (config: PageActiveParams) => {
  const { onPageVisibilityChange, hideDelayTime = 0 } = config;
  const onPageVisibilityChangeRef = useNewRef(onPageVisibilityChange);
  const hideDelayTimeRef = useNewRef(hideDelayTime);
  const timerRef = useNewRef<NodeJS.Timeout | undefined>(undefined);

  const onVisibilityChange = useCallback(() => {
    if (document.hidden == null) {
      return;
    }
    if (hideDelayTimeRef.current > 0) {
      // 存在setTimeout,则取消且不再执行后续操作
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
        return;
      }
      // 不存在 setTimeout
      // 隐藏了页面，则延迟执行
      if (document.hidden) {
        timerRef.current = setTimeout(() => {
          onPageVisibilityChangeRef.current(document.hidden);
          timerRef.current = undefined;
        }, hideDelayTimeRef.current);
      } else {
        // 显示页面，则立即执行
        onPageVisibilityChangeRef.current(document.hidden);
      }
    } else {
      onPageVisibilityChangeRef.current(document.hidden);
    }
  }, [onPageVisibilityChangeRef, hideDelayTimeRef]);

  useEffect(() => {
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [onVisibilityChange, timerRef]);
};

export default usePageVisibilityChange;
