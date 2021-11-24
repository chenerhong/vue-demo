// src/init.js
import { initState } from './state.js'
import { compileToFunctions } from './compile.js'
import { Watcher } from './watcher.js'

export function initMixin(MyVue) { 
  MyVue.prototype._init = function(options) {
    const vm = this
    vm.$options = options
    initState(vm)
    if(vm.$options.el && vm.$options.template) {
      vm.$mounted(vm.$options.el)
    }
  }
  MyVue.prototype.$mounted = function(el) {
    const vm = this
    el = vm.$el = query(el)
    let template = vm.$options.template
    // 根据template获取render方法
    const { render } = compileToFunctions(template, vm)
    // 保存在vm内，执行watcher后调用，也就是更新
    vm._render = render
    // 创建渲染watcher
    mountComponent(vm)
  }
}

function mountComponent(vm) {
  let updateComponent = () => {
    const tem = vm._render()
    vm.$el.innerHTML = tem
  }
  console.log('start mount')
  // 渲染watcher
  new Watcher(vm, updateComponent, () => {}, {
  	before() {
    	console.log('beforeUpdate')
    }
  }, true)
  console.log('mounted')
  vm.$options.mounted && vm.$options.mounted.call(vm)
}

// 容错，没有找到el节点就创建一个
function query(el) {
  let element = document.querySelector(el)
  if(!element) {
    console.error(`没有找到${el}节点`)
    element = document.createElement('div')
  }
  return element
}
