# bind 实现

bind 模拟

```javascript
Function.prototype.selfBind = function (context) {
  const args = []
  for(var i = 1, len = arguments.length; i< len; i++) {
    args.push(arguments[i])
  }
  var fn = this
  return function () {
    var args2 = []
    for(var i = 0, len = arguments.length; i< len; i++) {
      args2.push(arguments[i])
    }
    var allArgs = args.concat(args2)
    return fn.apply(context, allArgs)
  }
}
```

但是bind 返回的函数是可以当做构造函数使用的，目前还是不能实现

```javascript
Function.prototype.selfBind = function (context) {
  const args = []
  for(var i = 1, len = arguments.length; i< len; i++) {
    args.push(arguments[i])
  }
  var fn = this
  function bindWrap () {
    var args2 = []
    for(var i = 0, len = arguments.length; i< len; i++) {
      args2.push(arguments[i])
    }
    var allArgs = args.concat(args2)
    const _this = this instanceof wrap ? this : context // 如果是构造函数就使用构造函数本身的this
    return fn.apply(_this, allArgs)
  }
  // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
  bindWrap.prototype = this.prototype;
  return bindWrap
}
```

但是此时如果我们为bind后的函数设置prototype属性会修改原始的函数的prototype属性

```javascript
Function.prototype.selfBind = function (context) {
  if (typeof this !== "function") {
    throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
  }
  const args = []
  for(var i = 1, len = arguments.length; i< len; i++) {
    args.push(arguments[i])
  }
  var fn = this
  function bindWrap () {
    var args2 = []
    for(var i = 0, len = arguments.length; i< len; i++) {
      args2.push(arguments[i])
    }
    var allArgs = args.concat(args2)
    const _this = this instanceof bindWrap ? this : context // 如果是构造函数就使用构造函数本身的this
    return fn.apply(_this, allArgs)
  }
  // 加一层原型链

  // 实现 1
  // function midFn () {}
  // midFn.prototype = this.prototype;
  // bindWrap.prototype = new midFn()

  // 实现 2
  bindWrap.prototype = Object.create(this.prototype)

  return bindWrap
}
```

