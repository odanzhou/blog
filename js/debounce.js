// 防抖函数

const debounce = (fn, wait) => {
  let timer = null
  return function handle(...args) {
    if(timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, wait)
  }
}