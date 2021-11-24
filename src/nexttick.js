
const cbs = []
let pendding = false

function flushCallbacks() {
  pendding = false
  // 遍历更新方法，执行所有更新任务
  for(let i = 0;i<cbs.length;i++) {
    cbs[i]()
  }
}

// 优雅降级，让flushCallbacks在同步代码执行完之后执行
let timeFunc
if(typeof Promise !== 'undefined') {
  const p = Promise.resolve()
  timeFunc = () => {
    p.then(flushCallbacks)
  }
} else if(typeof MutationObserver !== 'undefined') {
  let counter = 1
  // 在指定的DOM发生变化时被调用
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true // 观查字符数据变化
  })
  timerFunc = () => {
    // 字符变化后调用flushCallbacks
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
} else if (typeof setImmediate !== 'undefined') {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(fn) {
  cbs.push(fn)
  // 同步的update会多次执行nextTick，但是我们只执行一次，等异步队列清空之后再重新执行
  if(!pendding) {
    pendding = true
    timeFunc()
  }
}