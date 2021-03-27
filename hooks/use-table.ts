import { useCallback, useMemo, useRef } from 'react';
import { useFetch } from '@/hooks';
import type { ObjectType, FetchType, TableDateType } from '@/interface';
import type { TableParams, PickOne } from '@/interface';
import type { TableProps } from 'antd/lib/table';
import type { SorterResult } from 'antd/lib/table/interface';

const defaultPaginationOptions = {
  current: 1,
  showSizeChanger: false,
  showQuickJumper: true,
  showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} 总共 ${total} 条`,
};

type TableConfig<M> = {
  initParams?: M | undefined; // 初始化参数
  pageSize?: number; // 默认 10
  initPagination?: ObjectType;
  immediate?: boolean; // 初始化执行网络请求，默认true
  manualFetch?: boolean; // 手动调用网络请求，默认false
  dataHandle?: (data: any, response: any) => any;
  errorHandle?: (setState: React.Dispatch<React.SetStateAction<any>>) => any; // 错误处理
  shouldFetch?: (params: ObjectType) => boolean; // 是否请求
};

type TableChangeType<T> = NonNullable<PickOne<TableProps<T>, 'onChange'>>;

/**
 * @template T
 * @param {FetchType} onFetch // 网络请求, 自己先处理好数据，保证数据的没问题
 * @param {undefined | {[key: string]: any}} params // 请求参数，变化时会自动加上pageNum
 * @param {undefined | {
 *  initParams?: {[key: string]: any}, // 初始化参数
 *  pageSize?: number, // 默认 10
 *  initPagination?: {[key: string]: any},
 *  immediate: boolean, // 初始化执行网络请求，默认true
 *  manualFetch: boolean, // 手动调用网络请求，默认false
 *  dataHandle?(data: any, response: any): any
 *  errorHandle?: (fn: Function) => any; // 错误处理
 * }} config // 配置
 */
const useTable = <
  T = any,
  P extends ObjectType = ObjectType,
  M extends ObjectType = Record<string, unknown>
>(
  onFetch: FetchType<TableDateType<T>, P>,
  params?: Partial<P> | undefined,
  config: TableConfig<M> = {},
) => {
  const {
    pageSize: pageSizeConf = 10,
    initPagination: paginationConf,
    initParams,
    immediate = true,
    manualFetch = false,
    dataHandle,
    errorHandle,
  } = config;

  const paginationRef = useRef({
    ...defaultPaginationOptions,
    ...paginationConf,
    pageSize: pageSizeConf,
  });

  const tableParams = useMemo(() => {
    return {
      pageNum: defaultPaginationOptions.current,
      ...params,
    } as P & { pageNum: number };
  }, [params]);

  const {
    loading, // 加载状态
    data, // 数据
    setData, // 设置数据
    onCXFetch, // 请求
    setParams, // 改变参数
    allParams,
    extraRes,
  } = useFetch<TableDateType<T>, P>(onFetch, tableParams, {
    immediate,
    manualFetch,
    dataHandle,
    errorHandle,
    initParams: {
      pageSize: pageSizeConf,
      pageNum: defaultPaginationOptions.current,
      ...initParams,
    } as M & { pageNum: number; pageSize: number },
  });

  // 数据源
  const dataSource = useMemo(() => {
    return (data && data.list) || [];
  }, [data]);

  // 设置数据源
  const setDataSource = useCallback(
    (fnOrList: T[] | ((list: T[]) => T[])) => {
      setData((x) => ({
        ...(x as TableDateType<T>),
        list:
          typeof fnOrList === 'function' ? fnOrList((x as TableDateType<T>).list || []) : fnOrList,
      }));
    },
    [setData],
  );

  // type OnChangeType = TableChangeType<T>;
  const onChange = useMemo(() => {
    return onTableChange((res) => {
      setParams((x) => ({ ...x, ...res }));
    });
  }, [setParams]);
  // const onChangeOld = useCallback<OnChangeType>(
  //   (pagination, filters, sorter) => {

  //     const { current: pageNum = 1, pageSize } = pagination;
  //     // 位处理sorter为数组的情况
  //     // 'ASC', 'DESC',(将 'descend' | 'ascend' 转化下)
  //     let order: 'ASC' | 'DESC' | undefined;
  //     let sortCode: PickOne<SorterResult<T>, 'field'>;
  //     if (!Array.isArray(sorter)) {
  //       sortCode = sorter.field;
  //       if (sorter.order === 'ascend') {
  //         order = 'ASC';
  //       } else if (sorter.order === 'descend') {
  //         order = 'DESC';
  //       } else {
  //         order = undefined;
  //       }
  //     }
  //     setParams((x) => {
  //       if (pageSize) {
  //         return {
  //           ...x,
  //           pageNum,
  //           pageSize,
  //           order,
  //           sortCode,
  //         };
  //       }
  //       return { ...x, pageNum, order, sortCode };
  //     });
  //   },
  //   [setParams],
  // );

  // 分页信息
  const current = (data && data.pageNum) || 1;
  const total = (data && data.total) || 0;
  const pagination = useMemo(() => {
    return {
      ...paginationRef.current,
      current,
      total,
    };
  }, [current, total]);
  const tblParams = allParams as M & P & TableParams;
  return {
    loading, // 加载状态
    allParams: tblParams, // 所有参数
    onCXFetch,
    pagination, // 表格pagination
    dataSource, // 表格数据源
    setDataSource, // 设置表格数据
    setParams, // 改变表格参数
    onChange, // 表格改变
    extraRes, // 其它数据
    sum: data && data.sum, // 数据总计
    pageSum: data && data.pageSum, // 当页数据总计
  };
};

export default useTable;

function onTableChange<T>(
  onChange: (params: {
    pageNum: number;
    order?: 'ASC' | 'DESC';
    sortCode: PickOne<SorterResult<T>, 'field'>;
    pageSize?: number;
  }) => void,
) {
  const handler: TableChangeType<T> = (pagination, filters, sorter, extra) => {
    const { current: pageNum = 1, pageSize } = pagination;
    // 位处理sorter为数组的情况
    // 'ASC', 'DESC',(将 'descend' | 'ascend' 转化下)
    let order: 'ASC' | 'DESC' | undefined;
    let sortCode: PickOne<SorterResult<T>, 'field'>;
    if (!Array.isArray(sorter)) {
      sortCode = sorter.field;
      if (sorter.order === 'ascend') {
        order = 'ASC';
      } else if (sorter.order === 'descend') {
        order = 'DESC';
      } else {
        order = undefined;
      }
    }

    if (pageSize) {
      onChange({
        pageNum,
        pageSize,
        order,
        sortCode,
      });
    }
    return onChange({ pageNum, order, sortCode });
  };
  return handler;
}

export { onTableChange };
