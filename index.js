const { Glang } = require("./glang.js")

let code = '1 2 3 r 9 + '
// stack = [7]


// 1 2 3 + 4 5 6

let g = new Glang(code)


for(let command of g.commands){
	g.doCommand(command)
}

console.log(g)
// console.log(g.)
console.log(g.stack)
// console.log(JSON.stringify(g.stack.stack, null, 2))
console.log(g.stack.pretty())