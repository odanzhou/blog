# 饿了么框架异步获取Select的Option数据

当`select`组件中的`option`数据需要异步获取时, 如何正确的显示以及如何传递值给后端

默认情况下是通过`{a: 'a'}`的形式直接传过去, 值是基本类型, 但由于`select`组件的`option`的数据需要`label`和`value`, 显示的`label`, 传递的是`value`的值, 如果`label`和`value`的值是一样的, 即使异步也没问题, 但如果是异步则会存在问题, 由于保存时值为`value`的值, 表单初始化时获取到的值, 与显示的就会有差异, 如:

```
[{
    label:"01",
    value:"男"
}, {
    label:"02",
    value:"女"
}, {
    label:"03",
    value:"未知"
}]
```

当选择男后, 保存的值会是`01`, 当下次表单初识化时获取到的值就会是`01`, 不会时显示男, 即使远程获取到了`option`需要的数据也会显示异常

目前想到的解决方案是, 保存时传递一个对象而非基本类型给后台, 后台根据需要保存对应的值, 同时初始化的时候也得到一个对象, 对对象进行处理, 初始化是直接将`label`的值显示出来, `demo`代码如下

```vue
<template>
  <div>
    <el-select
      v-model="selectValue"
      placeholder="请选择"
      @focus.self='getList'
    >
      <el-option
        v-for="item in list"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </div>
</template>
<script>
export default {
  name: 'test',
  props: {
    theValue: {
      type: Object,
      default: () => ({
        label:"css 好",
        value:"CSS"
      })
    }
  },
  data () {
    return {
      list: [],
      valItem: this.theValue,
      hasChange: false
    }
  },
  computed: {
    selectValue: {
      get () {
        const {label, value} = this.valItem
        return this.hasChange ? value : label
      },
      set (val) {
        const valItem = this.list.find(item => item.value === val) || {}
        this.hasChange = true
        this.valItem = valItem
        this.$emit('input:update', valItem)
      }
    }
  },
  watch: {
    'theValue': {
      handler (val = {}) {
        this.valItem = val
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    getList () {
      setTimeout(()=>{
        this.list = [
          {
            label:"css 好",
            value:"CSS"
          }, {
            label:"html 好",
            value:"HTML"
          }, {
            label:"javascript 好",
            value:"JS"
          }
        ]
      }, 100)
    }
  }
}
</script>
```

初始化的时候或许可以判断一下, 当前的`option`时候存在值, 如果不存在且存入的数据存在, 可以作为`option`的数据

相关技术

- [JavaScript](https://www.javascript.com/)
- [Vue全家桶](https://cn.vuejs.org/)
- [Express](http://expressjs.com/)
- [Mongoose](http://mongoosejs.com/)
- [ES6](http://es6.ruanyifeng.com/)
- [Flex布局](http://www.runoob.com/cssref/css3-pr-flex.html)

联系我

- [邮箱](mailto:hosalt@qq.com)
