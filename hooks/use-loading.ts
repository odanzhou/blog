import { useCallback, useState } from 'react';
import useNewRef from './use-new-ref';

const useLoading = (InitLoading = false) => {
  const [loading, setLoading] = useState(InitLoading);
  const loadingRef = useNewRef(loading);

  const onLoadingChange = useCallback(
    (state: boolean) => {
      loadingRef.current = state;
      setLoading(state);
    },
    [loadingRef],
  );

  const onLoadingStart = useCallback(() => {
    onLoadingChange(true);
  }, [onLoadingChange]);

  const onLoadingEnd = useCallback(() => {
    onLoadingChange(false);
  }, [onLoadingChange]);

  const isLoading = useCallback(() => {
    return loadingRef.current === true;
  }, [loadingRef]);

  const onLoading = useCallback(() => {
    onLoadingStart();
    return () => onLoadingEnd();
  }, [onLoadingStart, onLoadingEnd]);

  return {
    loading,
    loadingRef,
    onLoadingChange,
    onLoadingStart,
    onLoadingEnd,
    isLoading,
    onLoading,
  };
};

export default useLoading;
