# apply 实现

手动实现`apply `方法

```javascript
function getTempFunctionName (obj, temp) {
  temp = temp == null ? '_$fn' : temp
  if(temp in obj) {
    return getTempFunctionName(obj, '_$' + temp)
  } else {
    return temp
  }
}

Function.prototype.selfApply = function (context, argList) {
  argList = argList == null ? [] : argList
  if(typeof argList !== 'object') {
    throw Error('Uncaught TypeError: CreateListFromArrayLike called on non-object')
  }
  var thisType = typeof context
  if(thisType == 'string') { // 将基本类型转化为对象
    context = new String(context)
  } else if(thisType == 'booelan') {
    context = new Boolean(context)
  } else if(thisType == 'number') {
    context = new Number(context)
  } else { // 对象或window
    context = context || window
  }
  var tempFnName = getTempFunctionName(context)
  context[tempFnName] = this
  var len = Number(argList.length)
  len = isNaN(len) ? 0 : len
  var args = []
  for(var i=0; i < len; i++) {
    args.push(argList[i])
  }
  var res = eval("context[tempFnName]("+ args +")")
  delete context[tempFnName]
  return res
}
```

缺点：严格模式下无法生效，严格模式是`ECMAScript 5`才有的，此时用不着模拟`apply`了