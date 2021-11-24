import { pushTarget, popTarget } from './dep.js'
import { queueWatcher } from './queue.js'
let uid = 0
export class Watcher{
  constructor(vm, expOrFn, userCb, options = {}, isRenderWatcher) {
    this.vm = vm
    this.isRenderWatcher = isRenderWatcher
    this.id = uid++
    // computed Watcher和渲染Watcher的expOrFn都是函数
    // user Watcher是key，对key求值，给对应data的Dep添加user Watcher
    if(typeof expOrFn === 'function') {
      this.getter = expOrFn
    } else {
      this.getter = parsePath(expOrFn)
    }
     // user watcher标识
    this.user = options.user
    this.deep = options.deep
    // 计算属性
    this.dirty = this.lazy = options.lazy
    // 回调
    this.userCb = userCb
    // 存dep
    this.deps = []
    // 存depId
    this.depIds = new Set()
    this.value = this.lazy ? undefined : this.get()
    this.before = options.before
  }
  get() {
    pushTarget(this)
    const value = this.getter.call(this.vm, this.vm)
    if(this.deep) {
      traverse(value)
    }
    popTarget()
    return value
  }
  addDep(dep) {
    const id = dep.id
    // 去重
    if(!this.depIds.has(id)) {
      this.deps.push(dep)
      this.depIds.add(id)
      dep.addSub(this)
    }
  }
  // 收集更新队列
  update() {
    if(this.lazy) {
      this.dirty = true
    } else {
      queueWatcher(this)
    }
  }
  // 真正触发更新
  run() {
    const oldVal = this.value
    const newVal = this.get()
    this.value = newVal
    // 引用类型的新老值是相等的，指向同一个地址
    if(oldVal !== newVal || (newVal !== undefined && (Array.isArray(newVal) || newVal.constructor === Object))) {
      if(this.user) {
        this.userCb.call(this.vm, newVal, oldVal)
      } else {
        this.userCb.call(this.vm)
      }
    }
  }
  evaluate() {
    // 求值，获取依赖 -> 例如a(){return this.a+this.b}，执行get求值后，a和b的dep收集computed Watcher，computed Watcher的deps收集a和b的dep
    this.value = this.get()
    // 求值之后如果依赖不更新就不会重新求值
    this.dirty = false
  }
  depend() {
    // 遍历computed Watcher收集到的dep，也就是依赖项的dep，其实这时候的Dep.target为渲染Watcher，所以就是给依赖项添加渲染Watcher
    for(let i = 0;i < this.deps.length; i++) {
      this.deps[i].depend()
    }
  }
}

// 可能是'a.b.c'，在执行getter的时候会call(vm, vm)，所以等于vm[a][b][c]
// 求值，走data的劫持的get，所以添加了user Watcher
function parsePath(path) {
  const arr = path.split('.')
  return (obj) => {
    for(let i=0;i<arr.length;i++) {
      obj = obj[arr[i]]
    }
    return obj
  }
}

function traverse(val) {
  const depIds = new Set()
  // 递归
  function deep(value, seen) {
    // 不是对象或者数组直接return
    if(!Array.isArray(value) && value.constructor !== Object) {
      return 
    }
    // 是否是响应式，如果是添加dep.id，避免重复添加watcher
    if(value.__ob__) {
      const id = value.__ob__.dep.id
      if(seen.has(id)) {
        return 
      }
      seen.add(id)
    }
    // 数组或对象不断取值
    if(Array.isArray(value)) {
      let i = value.length
      while (i--) deep(value[i], seen)
    } else {
      let keys = Object.keys(value)
      let i = keys.length
      while (i--) deep(value[keys[i]], seen)
    }
  }
  deep(val, depIds)
}