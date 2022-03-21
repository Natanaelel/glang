const { Glang } = require("./glang.js")

function test_programs(){
	let programs = require("fs").readFileSync("./test_programs.txt").toString().split(/\s*\*\*\*\s*/).filter(x => x != "")

	for(const program of programs){
		let g = new Glang(program)
		g.run()
		console.log(g.stack.pretty())
		console.log(g.stack.top())
		console.log("")

	}
}

let program = `
1 2 3 dup wrap reverse dump
"https://gurka.se/" get 100 take
`
program = `
 10 range 2 *
"https://emkc.org/api/v2/piston/runtimes" get
`

let g = new Glang(program)
g.run()

console.log(g.stack.pretty())
console.log("")
console.log(g.stack.top())

