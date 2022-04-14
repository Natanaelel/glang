const { Glang } = require("./glang.js")
const fs = require("fs")
function test_programs(){
	let programs = fs.readFileSync("./test_programs.txt").toString().split(/\s*\*\*\*\s*/).filter(x => x != "")

	for(const program of programs){
		let g = new Glang(program)
		g.run()
		console.log(g.stack.pretty())
		console.log(g.stack.top())
		console.log("")

	}
}

let program_path = process.argv[2] || "./test.glang"
let program = fs.readFileSync(program_path).toString()
// program = "10 range reverse dump 4 wrapN"



// let g = new Glang(program, {"verbose": true})

let settings = {
	"verbose": false,
	// "debug": true,
	"warnings": true,
	// "logfunction": (self, command) => console.log(command.value, self.stack.stack)

}
let g = new Glang(program, settings)
// console.log(g)
g.run()

console.log(g.stack.pretty())
console.log("")
console.log(g.stack.top())
console.log("")
// console.log(g)
// console.log(g.stack.raw())


