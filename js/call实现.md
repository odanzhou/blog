# call 实现

手动实现`call`方法

```javascript
function getTempFunctionName (obj, temp) {
  temp = temp == null ? '_$fn' : temp
  if(temp in obj) {
    return getTempFunctionName(obj, '_$' + temp)
  } else {
    return temp
  }
}

Function.prototype.selfCall = function (context) {
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
  var args = []
  for(var i=1, len=arguments.length; i < len; i++) {
    args.push(arguments[i])
  }
  var res = eval("context[tempFnName]("+ args +")")
  delete context[tempFnName]
  return res
}
```

缺点：严格模式下无法生效，严格模式是`ECMAScript 5`才有的，此时用不着模拟`call`了