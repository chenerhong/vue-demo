import { Dep } from './dep.js'
import { observe } from './observe.js'
import { Watcher } from './watcher.js'
export function initState(vm) {
  const opts = vm.$options
  if(opts.methods) initMethods(vm, opts.methods)
  if(opts.data) initData(vm, opts.data)
  if(opts.computed) initComputed(vm, opts.computed)
  if(opts.watch) initWatcher(vm, opts.watch)
}

function initMethods(vm, methods) {
  for(let key in methods) {
    const fn = methods[key]
    if(typeof fn !== 'function') {
      console.log(`${key} not function`)
    }
    vm[key] = fn !== 'function' ? () => {} : fn.bind(vm)
  }
}

function initData(vm, data) {
  const methods = vm.$options.methods
  data = vm._data = typeof data === 'function' ? data.call(vm) : data || {}
  for(let key in data) {
    if(methods && methods.hasOwnProperty(key)) {
      console.log(`data ${key}和methods函数重名了`)
    }
    proxy(vm, '_data', key)
  }
  observe(data)
}

function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    configurable: true,
    enumerable: true,
    get() {
      return this[source][key]
    },
    set(val) {
      this[source][key] = val
    }
  })
}

function initWatcher(vm, watch) {
  // 遍历
  for(let key in watch) {
    const handler = watch[key]
    // 是数组，循环创建user Watcher
    if(Array.isArray(handler)) {
      let i = handler.length
      while(i--) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      // 直接创建user Watcher
      createWatcher(vm, key, handler)
    }
  }
}

function createWatcher(vm, key, handler) {
  let options = {}
  // 对象，获取回调和参数
  if(handler.constructor === Object) {
    options = handler
    handler = handler.handler
  }
  // 字符串，直接获取methods的方法
  if(typeof handler === 'string') {
    handler = vm[handler]
  }
  // user Watcher标识
  options.user = true
  // 创建watcher
  const watcher = new Watcher(vm, key, handler, options)
  // 立即执行
  if(options.immediate) {
    handler.call(vm, watcher.value)
  }
}

function initComputed(vm, computed) {
  // 保存watcher
  const watchers = vm._computedWatchers = {}
  for(let key in computed) {
    const userDef = computed[key]
    // 可能是function，也可能是对象，是对象获取get作为表达式
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 创建computed Watcher，lazy作为标识。因为使用computed的都是在其余函数或者模版中，使用到的时候再求值和获取关联的进行中的Watcher
    // 保存每一个watcher
    watchers[key] = new Watcher(vm, getter, () => {}, {lazy: true})
    // 做一层劫持，用来获取关联的Watcher
    if(!(key in vm)) {
      defineComputed(vm, key, userDef)
    }
  }
}

function defineComputed(vm, key, userDef) {
  const isFn = typeof userDef === 'function'
  // 挂载到实例
  Object.defineProperty(vm, key, {
    configurable: true,
    enumerable: true,
    get() {
      // 获取computed Watcher
      const watcher = vm._computedWatchers[key]
      // 如果是脏值就执行Watcher get，获取依赖
      if(watcher.dirty) {
        watcher.evaluate()
      }
      if(Dep.target) {
        watcher.depend()
      }
      return watcher.value
    },
    // 取对象的set或者空函数
    set: isFn ? () => {} : (userDef.set || function() {})
  })
}