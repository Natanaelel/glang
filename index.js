// const parse = require("./parser.js")

// const functions = require("./functions")
const { Glang } = require("./glang.js")

let code = '1 2 3 r'


let g = new Glang(code)

console.log(g)

for(let command of g.commands){
	g.doCommand(command)
}

console.log(g)
// console.log(g.)
console.log(g.stack)
console.log(JSON.stringify(g.stack.stack, null, 2))