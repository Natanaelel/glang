const { Glang } = require("./glang.js")

let code = `
	1 10 3 r { 1 + } map { range } map dump max + dump wrap dup length swap {60 + } map 26 range 64 + string swap 2 take dup last string 4 r dump + 'A split

`
code = `
100 range { dup 2 / swap  2.0 / - 0 = } filter
`
// stack = [7]


// 1 2 3 + 4 5 6

let g = new Glang(code)


for(let command of g.commands){
	g.doCommand(command)
}


console.log(g.stack.pretty())