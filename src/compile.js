// <div>{{obj.name}}</div> -> <div>my name</div>
export function compileToFunctions(template, vm) {
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
  const render = function () {
    return template.replaceAll(defaultTagRE, (match, key) => {
      const value = parseEx(vm, key)
      return value ? value : ''
    })
  }
  return {render}
}

function parseEx(vm, key) {
  const arr = key.split('.')
  let value = vm
  for(let i=0;i<arr.length;i++) {
    value = value[arr[i]]
  }
  return value
}