import { initMixin } from './init.js'

function MyVue(options) {
  this._init(options)
}

initMixin(MyVue)

// MyVue.prototype.$mounted = function(el) {
  
// }

export default MyVue