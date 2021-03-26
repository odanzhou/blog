// 浅比较两次props(params)中发生变化的参数, 第一次不比较

import { useEffect, useRef, useMemo } from 'react'
import { isDev } from '@/utils/utils'
import type { ObjectType } from '@/interface'

type DiffConfigType = {
  showDetail?: boolean, // 默认false，差异数据为对象是不展示细节
}

/**
 * 两次 props 差异比较，用于分析性能问题
*/
const usePropsDiff = <T extends ObjectType>(props: T, config: DiffConfigType = {}) => {
  const prevPropsRef = useRef<T | undefined>()
  const { showDetail = false } = config
  const configRef = useRef({
    showDetail
  })
  useMemo(() => {
    if(!isDev || !prevPropsRef.current) return
    const { current: prevProps } = prevPropsRef;
    if (props !== prevProps) {
      const oldKeys = Object.keys(prevProps);
      const keys = Object.keys(props);
      const resInfos: string[] = []
      const res: Record<string, {
        oldValue: any,
        newValue: any,
        extra?: string,
      }> = {}
      const hash: Record<string, boolean> = {}
      const valToStr = (val: any) => !configRef.current.showDetail ? val : val != null && typeof val === 'object' ? JSON.stringify(val) : val
      const setDiffInfo = (key: string, oldValue: any, newValue: any, extra?: string) => {
        resInfos.push(`${ key }：${ valToStr(oldValue) } => ${valToStr(newValue)}，${ extra ? (`extra:${  extra}`) : ''}`)
        res[key] = {oldValue, newValue, extra}
      }
      oldKeys.forEach(key => {
        if(!Object.is(prevProps[key], props[key])) {
          const extra = !keys.includes(key) ? `已删除 key: ${key}` : undefined
          setDiffInfo(key, prevProps[key], props[key], extra)
        }
        hash[key] = true
      })
      keys.forEach(key => {
        if(!hash[key]) {
          if(!Object.is(prevProps[key], props[key])) {
            const extra = !oldKeys.includes(key) ? `已增加 key: ${key}` : undefined
            setDiffInfo(key, prevProps[key], props[key], extra)
          }
        }
      })
      if(resInfos.length) {
        console.log('diff info =========>>>>>>>>>>>>>>>')
        console.log( resInfos.join('\n'))
        console.dir(res)
        console.log('diff info <<<<<<<<<<==============')
      }
    }
  }, [props]);

  useEffect(() => {
    prevPropsRef.current = props
  })
}

export default usePropsDiff
