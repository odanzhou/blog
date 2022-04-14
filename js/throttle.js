// 节流

const throttle = (fn, wait) => {
  let time = null
  return function handle(...args){
    if(time && Date.now() - time < wait) {
      return
    }
    time = Date.now()
    fn.apply(this, args)
  }
}