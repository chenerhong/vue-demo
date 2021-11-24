// src/dep.js
import { Dep } from "./dep.js"
import { arrayMethods } from './array.js'

export function observe(data) {
  if (!Array.isArray(data) && data.constructor !== Object) {
    return
  }
  // 如果存在__ob__属性，就证明已经是响应式，直接返回实例就可以
  let ob
  if (data.hasOwnProperty('__ob__') && data.__ob__ instanceof Observer) {
    ob = data.__ob__
  } else {
    ob = new Observer(data)
  }
  return ob
}
class Observer {
  constructor(data) {
    // 只有数组使用到了这个dep
    this.dep = new Dep()
    // 给data添加不可枚举的__ob__属性，标记为响应式
    this.insetOb(data, this)
    // 如果是数组类型，重写数组的原型
    if (Array.isArray(data)) {
      // 当前data原型链继承
      data.__proto__ = arrayMethods
      this.observeArray(data)
    } else {
      this.walk(data)
    }
  }
  // 
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
  // 递归，不断重写数组的原型方法
  observeArray(data) {
    for(let i=0;i<data.length;i++) {
      observe(data[i])
    }
  }
  insetOb(data, value) {
    Object.defineProperty(data, '__ob__', {
      configurable: true,
      enumerable: false,
      value
    })
  }
}
function defineReactive(data, key) {
  let val = data[key]
  const dep = new Dep()
  // 值的Observer实例
  let childOb = observe(val)
  Object.defineProperty(data, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 存在Watcher，给Watcher添加dep，给dep添加Watcher
      if (Dep.target) {
        dep.depend()
        // 如果存在值的Observer实例，也收集key对应的Watcher
        if(childOb) {
          childOb.dep.depend()
          // [1, [2, [3]]]，可能存在无限个嵌套数组，就无限收集Watcher
          if(Array.isArray(val)) {
            dependArray(val)
          }
        }
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()
    }
  })
}

function dependArray(val) {
  for(let i=0;i<val.length;i++) {
    let e = val[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if(Array.isArray(e)) {
      dependArray(e)
    }
  }
}