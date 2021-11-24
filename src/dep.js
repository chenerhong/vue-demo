let uid = 0
export class Dep{
  constructor() {
    // 唯一标识
    this.id = uid++
    // 保存Watcher
    this.subs = []
  }
  // 给Watcher添加dep，并且去重
  depend() {
    if(Dep.target) {
      Dep.target.addDep(this)
    }
  }
  // 收集watcher
  addSub(watcher) {
    this.subs.push(watcher)
  }
  // 遍历subs，执行update更新
  notify() {
    let len = this.subs.length
    while(len--) {
      this.subs[len].update()
    }
  }
}

// 当前watcher
Dep.target = null
// watcher栈
const targetStack = []

export function pushTarget(watcher) {
  targetStack.push(watcher)
  Dep.target = watcher
}

export function popTarget() {
  targetStack.pop()
  Dep.target = targetStack[targetStack.length - 1]
}