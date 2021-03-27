import { useRef, useState, useCallback, useEffect } from 'react';
import { useParams } from '@/hooks';
import type { OptionalObjectType, FetchType, ObjectType } from '@/interface';
import type { OnValidateType } from '@/interface/hook';

const InitTimestamp = Date.now();

type FetchConfigType<M extends ObjectType, T> = {
  initParams?: M; // 初始化参数
  immediate?: boolean; // 初始化执行，默认true
  manualFetch?: boolean; // 手动调用，默认false
  dataHandle?: (data: any, response: any) => T | undefined;
  errorHandle?: (setState: React.Dispatch<React.SetStateAction<T | undefined>>) => any; // 错误处理
  shouldFetch?: (params: ObjectType) => boolean; // 是否请求
  poll?: false | number; // 轮询，单位 s，false || number
  pollFirstDelay?: number; // 第一次轮询延期时间（可正可负）
  dynamicParamsFn?: (params: Record<string, any>) => void | Record<string, any>; // 动态添加参数
};

/**
 * 网络请求
 * FP: fetch params
 */
const useFetch = <T = any, FP = {}, P = {}, M = {}>(
  onFetch: FetchType<T, FP>,
  params?: P,
  config: FetchConfigType<M, T> = {},
) => {
  const {
    initParams,
    immediate = true,
    manualFetch = false,
    dataHandle,
    errorHandle,
    poll = false,
    shouldFetch,
    pollFirstDelay = 0,
    dynamicParamsFn,
  } = config;
  const [pollRestCount, setPollResetCount] = useState(0);
  const pollDelayRef = useRef({
    pollFirstDelay,
  });
  // 轮询发起的请求
  const isPollFetchRef = useRef(false);
  // 是否轮询
  const isPollRef = useRef(false);
  isPollRef.current = typeof poll === 'number';

  const timerRef = useRef<NodeJS.Timeout>();
  const initConfRef = useRef({
    immediate,
    manualFetch,
    dataHandle,
    shouldFetch,
    dynamicParamsFn,
    errorHandle,
  });
  const keyRef = useRef(InitTimestamp);
  const [timestamp, setTimestamp] = useState(InitTimestamp);
  const [loading, setLoading] = useState(!(!immediate || manualFetch));
  const pollLoadingRef = useRef(false);
  const [allParams, setAllParams] = useParams(params, initParams);
  const allParamsRef = useRef(allParams);
  allParamsRef.current = allParams;
  const [data, setData] = useState<T | undefined>();
  const [extraRes, setExtraRes] = useState<OptionalObjectType>();
  // 分离出来，便于可以主动发起请求
  // Omit<FP, keyof (P & M) >
  const onCXFetch = useCallback(
    (paramsData?: Partial<FP>) => {
      const key = keyRef.current;
      const isUpdate = () => key !== keyRef.current;
      // 轮询请求
      if (isPollFetchRef.current) {
        pollLoadingRef.current = true;
      } else if (isPollRef.current) {
        // 非轮询请求且需要轮询
        pollLoadingRef.current = false;
      }
      setLoading(true);
      // 请求未更新执行后续操作
      const onValidate = (isError: boolean) => {
        const handler: OnValidateType = (callBack) => {
          if (!isUpdate() && callBack) {
            return callBack(isError);
          }
        };
        return handler;
      };
      const { dynamicParamsFn: dynamicFn, errorHandle: errorHandleFn } = initConfRef.current;
      const dynamicParams =
        typeof dynamicFn === 'function' ? dynamicFn({ ...allParams, ...paramsData }) : undefined;
      return onFetch(({ ...allParams, ...paramsData, ...dynamicParams } as any) as FP)
        .then((res: any) => {
          if (isUpdate()) return;
          const { data: resData, ...otherMsg } = res;
          setExtraRes(otherMsg);
          const {
            current: { dataHandle: fn },
          } = initConfRef;
          const stateData: T | undefined = typeof fn === 'function' ? fn(resData, res) : resData;
          setData(stateData);
          setTimestamp(Date.now());
          if (!isPollFetchRef.current && isPollRef.current) {
            // 非轮询请求且需要轮询
            setPollResetCount((x) => x + 1);
          }
          isPollFetchRef.current = false;
          pollLoadingRef.current = false;
          setLoading(false);
          return [onValidate(false), isUpdate, stateData] as [
            OnValidateType,
            typeof isUpdate,
            typeof stateData,
          ];
        })
        .catch((error) => {
          if (isUpdate()) return;
          console.error(error);
          if (!isPollFetchRef.current && isPollRef.current) {
            // 非轮询请求且需要轮询
            setPollResetCount((x) => x + 1);
          }
          isPollFetchRef.current = false;
          pollLoadingRef.current = false;
          setLoading(false);
          const stateData: T | undefined =
            typeof errorHandleFn === 'function' && errorHandleFn(setData);
          return [onValidate(true), isUpdate, stateData] as [
            OnValidateType,
            typeof isUpdate,
            typeof stateData,
          ];
        });
    },
    [onFetch, allParams],
  );

  // 发送数据请求
  useEffect(() => {
    const { manualFetch: willManualFetch, immediate: isImmediate } = initConfRef.current;
    // 手动调用 或 不立即调用 不发送请求
    const needFetch = !willManualFetch && (InitTimestamp !== keyRef.current || isImmediate);
    if (needFetch) {
      const { shouldFetch: shouldFn } = initConfRef.current;
      if (typeof shouldFn === 'function') {
        if (shouldFn(allParamsRef.current)) {
          onCXFetch();
        }
      } else {
        onCXFetch();
      }
    }
    return () => {
      if (needFetch) {
        keyRef.current = Date.now();
      }
    };
  }, [onCXFetch]);

  // 卸载时
  useEffect(() => {
    return () => {
      isPollRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof poll === 'number' && !pollLoadingRef.current) {
      const pollFetch = (delayTime = 0) => {
        timerRef.current = setTimeout(() => {
          pollDelayRef.current.pollFirstDelay = 0;
          isPollFetchRef.current = true;
          const shouldFn = initConfRef.current.shouldFetch;
          if (typeof shouldFn === 'function' && !shouldFn(allParamsRef.current)) {
            pollFetch();
          }
          onCXFetch().then((onValidate) => {
            if (isPollRef.current) {
              pollFetch();
            }
            return onValidate;
          });
        }, Math.max(poll + delayTime, 0) * 1000);
      };
      pollFetch(pollDelayRef.current.pollFirstDelay);
    }
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [poll, onCXFetch, pollRestCount]);

  return {
    loading, // 加载状态
    pollLoading: pollLoadingRef.current, // 轮询请求状态
    data, // 数据
    setData, // 设置数据
    onCXFetch, // 请求
    setParams: setAllParams, // 改变参数
    allParams, // 所有参数
    extraRes,
    timestamp, // 请求成功后更新的时间戳
  };
};

export default useFetch;
