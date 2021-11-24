import { nextTick } from "./nexttick.js"

// Watcher队列
let queue = []
// Watcher id集合
let has = {}

// 循环执行Watcher的更新方法
function flushSchedulerQueue() {
  this.queue = queue.slice()
  for(let i=0;i<queue.length;i++) {
    const watcher = queue[i]
    if(watcher.before) {
      // beforeUpdate
      watcher.before()
    }
    watcher.run()
    if(watcher.isRenderWatcher) {
      console.log('update')
    }
  }
  // 执行完成后清空
  queue = []
  has = {}
}

export function queueWatcher(watcher) {
  const id = watcher.id
  // 判断当前id是否存在，可能（this.name = 1;this.name = 2;this.age=2）那么就存在3次，我们只保存一次Watcher就可以（渲染watcher id是同一个）
  if(!has[id]) {
    has[id] = true
    queue.push(watcher)
    // 异步，详细可以看看事件循环机制
    nextTick(flushSchedulerQueue)
  }
}