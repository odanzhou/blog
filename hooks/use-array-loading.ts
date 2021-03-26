import { useCallback, useState } from 'react';
import useNewRef from './use-new-ref';

const useArrayLoading = (length: number, InitLoading: boolean | boolean[] = false) => {
  const [loadingList, setLoadingList] = useState(() => {
    if (Array.isArray(InitLoading)) {
      return Array.from({ length }, (_, index) => {
        return InitLoading[index] || false;
      });
    }
    return Array.from({ length }, () => InitLoading);
  });

  const loadingListRef = useNewRef(loadingList);

  const onLoadingListChange = useCallback(
    (state: boolean, i: number) => {
      loadingListRef.current[i] = state;
      setLoadingList((x) => {
        const list = [...x];
        list[i] = state;
        return list;
      });
    },
    [loadingListRef],
  );

  const onLoadingListStart = useCallback(
    (i: number) => {
      onLoadingListChange(true, i);
    },
    [onLoadingListChange],
  );

  const onLoadingListEnd = useCallback(
    (i: number) => {
      onLoadingListChange(false, i);
    },
    [onLoadingListChange],
  );

  const onLoading = useCallback(
    (i: number) => {
      onLoadingListStart(i);
      return () => onLoadingListEnd(i);
    },
    [onLoadingListStart, onLoadingListEnd],
  );

  const isLoading = useCallback(
    (i: number) => {
      return loadingListRef.current[i] === true;
    },
    [loadingListRef],
  );

  return {
    loadingList,
    loadingListRef,
    onLoadingListChange,
    onLoadingListStart,
    onLoadingListEnd,
    onLoading,
    isLoading,
  };
};

export default useArrayLoading;
