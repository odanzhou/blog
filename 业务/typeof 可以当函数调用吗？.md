# typeof 可以当函数调用吗？

最近看高程，看到「typeof 是一个操作符，因此例子中的圆括号可以使用，但不是必需的」时，突然想到以前同事说 typeof 可以当作函数调用，当时觉得没什么毛病，typeof(1) 是能正常工作的，和调用一个函数的形式没什么差别，但现在突然发现一个操作符怎么能当作函数呢

```
typeof 1; // "number"
typeof(1); // "number"
```

### 不要被外表迷惑了

张无忌他妈曾经说过——越是漂亮的女人越是会骗人

```
function myTypeof(arg) {
	return typeof arg
}
myTypeof(1);
typeof(1);
```

typeof 与 myTypeof 的调用还真有点类似，还真容易把 typeof(1) 误认为函数调用

```
myTypeof(); // "undefined"
typeof();  // Uncaught SyntaxError: Unexpected token ')'
```

函数调用可以传入空的参数，但如果typeof当作函数调用，则直接报错了

更关键的一点是函数则表明是对象，是一种数据结构，它和操作符是天然冲突的，那么为什么typeof后面可以跟括号

### typeof 只是期待一个值

在js里面的很多东西可以用期待值来解释，对于 typeof 来说它期待后面是一个值，它判断紧随其后的表达式的值的类型，所以括号只是用来改变表达式的优先级而已

```
typeof (1 + '2'); // "string"
typeof 1 + '2';   // "number2"
```

下面还有些类似的情况

```
({}) instanceof(Object)
-(1); // -1
+(1): // 1
```

难道 instanceof、-、+ 都能当作函数调用？其实他们和函数半毛钱关系都没有
