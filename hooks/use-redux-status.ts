import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { ModelKeys, ModelStates } from '@/interface/model';
import { useNewRef } from '@/hooks';
import { PickOne } from '@/interface';

const useReduxStatus = <T extends ModelKeys, K extends keyof ModelStates[T], P = ModelStates[T][K]>(
  modelType: T,
  key: K,
  fnName = 'update',
) => {
  const dispatch = useDispatch();
  const status = useSelector(({ [modelType]: { [key]: value }}) => value);
  const statusRef = useNewRef(status);
  const setStatus = useCallback(
    (value: P, params?: Record<string, any>) => {
      dispatch({
        type: `${modelType}/${fnName}`,
        payload: {
          [key]: value,
        },
        params,
      });
    },
    [modelType, dispatch, key, fnName],
  );
  return {
    status,
    setStatus,
    statusRef,
  };
};

export default useReduxStatus;
