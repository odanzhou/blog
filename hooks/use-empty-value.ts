import { useMemo, useRef } from 'react'
import { valIsEmpty } from '../utils/utils'

/**
 * 处理数据值第一次由空变为其它值时，保持不变，针对先请求数据，根据请求的数据初始化后，会重复请求的问题
 * 1. undefined => undefined 2. 1 => undefined 2. 2 => 2
 */
const useEmptyValue = <T>(value: T | undefined) => {
  const initValueRef = useRef(value)
  const valRealUpdatedRef = useRef(!valIsEmpty(value))

  const val = useMemo(() => {
    if(valRealUpdatedRef.current){
      return value
    } if (valIsEmpty(initValueRef.current) && !Object.is(initValueRef.current, value)) {
      valRealUpdatedRef.current = true
      return initValueRef.current
    }
    return value
  }, [value])

  return val
}

export default useEmptyValue
