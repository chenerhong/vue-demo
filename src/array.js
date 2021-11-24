
// 数组的原型
const arrayProto = Array.prototype
// 继承数组原型
export const arrayMethods = Object.create(arrayProto)

// 会修改原数据的数组方法
const list = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

list.forEach(method => {
  // 原数组方法
  const original = arrayProto[method]
  Object.defineProperty(arrayMethods, method, {
    enumerable: true,
    configurable: true,
    value(...args) {
      // 原型数组方法取值
      const value = original.apply(this, args)
      // Observer，this代表数据本身，比如{a:[1,2]}，this代表a，__ob__在Observer中添加过，代表响应式
      const ob = this.__ob__
      let inset
      // 截取新的数据
      switch(method) {
        case 'push':
        case 'unshift':
          inset = args
          break;
        case 'splice':
          inset = args.slice(2)
          break;
      }
      // 新数据响应式处理
      if(inset) ob.observeArray(inset)
      // 触发更新
      ob.dep.notify()
      // 返回值
      return value
    }
  })
}) 