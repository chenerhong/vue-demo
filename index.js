import MyVue from './src/index.js'
new MyVue({
  el: '#app',
  data() {
    return {
      age: 20,
      names: ['我', ['子默']],
      a: {
        b: {
          c:111
        }
      }
    }
  },
  mounted() {
    // console.log(this.age)
    setTimeout(() => {
      this.age = 21
      this.age = 22
      this.age = 23
      this.a.b.c = 33
      // this.names.splice(1, 0, ['勇哥', ['子默', '迈克']])
      this.names.push('勇哥')
    }, 1000)
  },
  // mounted() {
  //   setTimeout(() => {
  //     this.sayAge()
  //   }, 1000)
  //   // setTimeout(() => {
  //   //   this.say()
  //   // }, 4000)
  // },
  // methods: {
  //   sayAge() {
  //     // this.age = 11
  //     // this.age = 22
  //     // this.age = 33
  //     this.name.push(111)
  //     // this.obj = {cc: 22}
  //   },
  //   say() {
  //     this.age = 99
  //   }
  // },
  watch: {
    age(nv, ov) {
      console.log(nv, ov, 'change')
    },
    a: {
      handler: function(nv, ov) {
        console.log(nv, ov, 'a')
      },
      deep: true
    },
    names(nv, ov) {
      console.log(nv, ov, 'names')
    }
  },
  computed: {
    ageName() {
      return 'age: ' + this.age
    }
  },
  template: `
    <div>{{age}}</div>
    <div>{{names}}</div>
    <div>{{ageName}}</div>
    <div>{{a.b.c}}</div>
  `
})

// .$mount('app')