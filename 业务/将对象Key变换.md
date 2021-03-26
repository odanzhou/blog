# 将对象Key变换

### 题目

将对象key的大写转化为_加小写字母，通过层级控制，超过层级控制，超出层级后不再继续转化

{xYz: 1} => {x_yz: 1}

### 初始化条件

初始化值和key变化函数

```
type Val = string | number | boolean | null | undefined
type Obj = {
  [key: string]: Val | Obj
}

const val: Obj = {
  aDC: 1,
  aFc: {
    x: 1,
    Y: 2,
  },
  aBc: {
    bCd: {
      cDe: 1
    }
  }
}

const getNewKey = (str: string) => str.replace(/[A-Z]/g, (s: string) => `_${s.toLowerCase()}`)
```

### 深度优先（DFS）

借助递归，现实

```
function keyHandle (obj:Obj, level: number) {
  const res: Obj = {}
  if(level < 0) {
    return obj
  }
  Object.keys(obj).forEach(key => {
    const val = obj[key]
    const newKey = getNewKey(key)
    if(val != null && typeof val === 'object') {
      res[newKey] = keyHandle(val, level - 1)
    } else {
      res[newKey] = val
    }
  })
  return res
}

// 0 表示第一层
keyHandle(val, 0) // {"a_d_c":1,"a_fc":{"x":1,"Y":2},"a_bc":{"bCd":{"cDe":1}}}
keyHandle(val, 1) // {"a_d_c":1,"a_fc":{"x":1,"_y":2},"a_bc":{"b_cd":{"cDe":1}}}
keyHandle(val, 2) // {"a_d_c":1,"a_fc":{"x":1,"_y":2},"a_bc":{"b_cd":{"c_de":1}}}
```

### 广度优先（BFS）

广度优先比较麻烦，需要考虑队列中层级的问题，需要考虑如何挂在到新的对象上的问题

```
function keyHandleBFS (obj:Obj, levelMax: number) {
  if(levelMax < 0) {
    return obj
  }
  const res: Obj = {}
  const queue: {level: number, item: Obj, mountRes: Obj}[] = [{level: levelMax, item: obj, mountRes: res}]
  let queueItem = queue.shift(), level: number, item: Obj, mountRes: Obj
  while(queueItem) {
    ({level, item, mountRes} = queueItem)
    level--
    Object.entries(item).forEach(([key, val]) => {
      key = getNewKey(key)
      if(level >=0 && val != null && typeof val === 'object') {
        mountRes[key] = {}
        queue.push({level, item: val, mountRes:  mountRes[key] as Obj })
      } else {
        mountRes[key] = val
      }
    })
    queueItem = queue.shift()
  }
  return res
}

keyHandleBFS(val, 0) // {"a_d_c":1,"a_fc":{"x":1,"Y":2},"a_bc":{"bCd":{"cDe":1}}}
keyHandleBFS(val, 1) // {"a_d_c":1,"a_fc":{"x":1,"_y":2},"a_bc":{"b_cd":{"cDe":1}}}
keyHandleBFS(val, 2) // {"a_d_c":1,"a_fc":{"x":1,"_y":2},"a_bc":{"b_cd":{"c_de":1}}}
```

最终结果和DFS结果一样
