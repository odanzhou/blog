# huffman编码实现

最近学习了霍夫曼编码，自己来实现下，[霍夫曼编码](https://zh.wikipedia.org/wiki/霍夫曼编码)

```
import HeapCommon from './HeapCommon'

interface INode {
  name: string,
  val: number,
}

interface ITree extends INode {
  left?: ITree,
  right?: ITree,
}
interface ICodeHash {
  [key: string]: string
}
function huffman (str: string) {
  // 处理非字符串及空字符串
  if(typeof str !== 'string' || str.length < 1) return undefined
  // 统计频率
  const strArr  = str.split('')
  const timesHash: {
    [key: string]: INode
  } = {}
  for(let key of strArr) {
    if(timesHash[key]) {
      timesHash[key].val++
    } else {
      timesHash[key] = {
        name: key,
        val: 1
      }
    }
  }
  // 将数据排序
  const list = Object.keys(timesHash).map(k => timesHash[k])
  const heap = new HeapCommon<ITree>(list, {
    getVal: (node: INode) => node.val,
    little: true
  })
  let littleOne: ITree, littleTwo: ITree, left: ITree
  while(heap.size() > 1) {
    // 取两个最小的值
    littleOne = heap.shift()
    littleTwo = heap.getValue() // 只获取，不堆化
    // 构建树，并产生虚拟节点，并放回堆中
    // 左节点优先放树（有left、right节点）（好像不这么操作也没什么问题，确实需要这么做，解码的时候需要这个规则）
    left = littleTwo.left ? littleTwo : littleOne
    heap.replace({
      val: littleOne.val + littleTwo.val,
      name: '',
      left,
      right: left === littleOne ? littleTwo : littleOne
    })
  }
  const tree = heap.getValue()
  const codeHash: ICodeHash = {}
  if(!tree.left) { // 只有一个节点
    codeHash[tree.name] = '0'
  } else {
    const handler = (tree: ITree | undefined, path: string) => {
      // // left 和 right，要么同时存在，要么同时不存在
      // if(!tree.left || !tree.right) { // 叶子节点
      //   res[tree.name] = path
      // } else {
      //   handler(tree.left, `${path}0`)
      //   handler(tree.right, `${path}1`)
      // }
      if(tree == null) return
      if(!tree.left && !tree.right) { // 叶子节点
        codeHash[tree.name] = path
      } else {
        handler(tree.left, `${path}0`)
        handler(tree.right, `${path}1`)
      }
    }
  }
  let codeStr = ''
  for(let char of strArr) {
    codeStr += codeHash[char]
  }
  // tree 就是一棵类 tire 树
  return [ codeStr, tree, codeHash] as [string, ITree, ICodeHash]
}
```

在构成树的过程中，需要对字符频率进行排序，还要插入新的数据，就用小顶堆来实现了，之前实现的堆是基于数字来处理的，改造下，使其更加通用

```
// 更通用的堆
interface IParams<T> {
  getVal?:(node: T) => number | string | T, // x => x，获取节点值
  little?: boolean, // true, 是否小顶堆
}

class HeapCommon<T> {
  private list: (T | undefined)[] = [] // 下标为0的地方不存值

  compare: (parentVal: T, childVal: T) => boolean
  
  // little true, true: 小顶堆, false: 大顶堆
  constructor(value?: T | T[], params?: IParams<T>) {
    const {
      little = true,
      getVal = x => x
    } = params || ({} as Partial<IParams<T>>)
    this.list = value == undefined ? [undefined] : [undefined].concat(Array.isArray(value) ? value : [value])
    if(little) {
      // 父节点的值是否大于子节点（大于则不满足小顶堆的定义，需要堆化处理）
      this.compare = (parentVal: T, childVal: T) => getVal(parentVal) > getVal(childVal)
    }  else {
      // 父节点的值是否小于子节点（小于则不满足大顶堆的定义，需要堆化处理）
      this.compare = (parentVal: T, childVal: T) => getVal(parentVal) < getVal(childVal)
    }
    this.initHeap()
  }

  // 获取堆的有效长度
  size = () => {
    return this.list.length - 1
  }

  // 获取堆顶元素值
  getValue = () => {
    return this.list[1]
  }

  // 用新的元素代替堆顶元素并堆化，返回之前的堆顶元素
  replace = (val: T) => {
    const heapVal = this.getValue()
    this.list[1] = val
    this.heapifyDown(1)
    return heapVal
  }

  initHeap = () => {
    const maxIndex = this.list.length - 1
    let heapIndex = maxIndex >> 1
    while(heapIndex > 1) {
      this.heapifyDown(heapIndex)
      heapIndex--
    }
  }

  // 从上往下堆化
  heapifyDown = (heapIndex: number) => {
    const maxIndex = this.list.length - 1
    let val: T
    let left: number, leftVal: T, right: number, rightVal: T
    let changeIndex: number | undefined
    const compare = this.compare
    const handler = (index: number) => {
      if(index < 1 || index > maxIndex) return
      val = this.list[index]
      left = index * 2
      leftVal = this.list[left]
      right = left + 1
      rightVal = this.list[right]
      changeIndex = undefined
      if(left <= maxIndex) {
        // 小顶堆 val > leftVal, 大顶堆 val < leftVal
        if(compare(val, leftVal)) changeIndex = left
        if(right <= maxIndex) {
          // 小顶堆 rightVal < (changeIndex == null ? val : leftVal)
          if(compare((changeIndex == null ? val : leftVal), rightVal)) {
            changeIndex = right
          }
        }
        if(changeIndex != null) {
          this.list[index] = this.list[changeIndex]
          this.list[changeIndex] = val
          handler(changeIndex) // 继续向下堆化
        }
      }
    }
    handler(heapIndex)
  }

  // 从下往上堆化
  heapifyUp = (heapIndex: number) => {
    let val: T
    let parent: number, parentVal: T
    const compare = this.compare
    const handler = (index: number) => {
      if(index <= 1) return
      val = this.list[index]
      parent = index >> 1
      parentVal = this.list[parent]
      if(parent >= 1) {
        // 小顶堆 val < parentVal 大顶堆 val > parentVal
        if(compare(parentVal, val)) {
          this.list[index] = parentVal
          this.list[parent] = val
          handler(parent) // 继续向上堆化
        }
      }
    }
    handler(heapIndex)
  }

  insert = (value: T) => {
    this.list.push(value)
    this.heapifyUp(this.list.length - 1)
  }

  shift = () => {
    const maxIndex = this.list.length - 1
    if(maxIndex < 1) return undefined
    if(maxIndex === 1) return this.list.pop()
    const val = this.list[1]
    // 将最后一个数据放在堆顶
    this.list[1] = this.list.pop()
    this.heapifyDown(1)
    return val
  }

  order = () => {
    let maxIndex = this.list.length - 1
    if(maxIndex < 1) return undefined
    const res: T[] = []
    while(maxIndex >= 1) {
      res.push(this.shift())
      maxIndex = this.list.length - 1
    }
    return res
  }
}
```

结果

```
var [strCode, tree] = huffman('aaaabbbccd')
// strCode: "1111010101001001000"
```

能编码还要能解码

```
function huffmanDecode(strCode: string, tree: ITree) {
  const strCodeArr = strCode.split('')
  let len = strCodeArr.length, res = '', char: string
  const handler = (tree: ITree | undefined, index: number) => {
    if(tree == null) return index
    char = strCodeArr[index]
    if(char === '0') {
      tree = tree.left
    } else if(char === '1') {
      tree = tree.right
    }
    if(!tree.left) { // 叶子节点
      res += tree.name
      return index + 1
    } else {
      return handler(tree, index + 1)
    }
  }
  let i = 0
  while(i < len) {
    if(!tree.left) { // 只有一个节点
      i++
      res += tree.name
    } else {
      i = handler(tree, i)
    }
  }
  return res
}

huffmanDecode(strCode, tree)
// "aaaabbbccd"
```

完成
