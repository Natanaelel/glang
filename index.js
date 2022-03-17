const { Glang } = require("./glang.js")

let code = `
	1 10 3 r { 1 + } map { range } map dump max + dump wrap dup length swap {60 + } map 26 range 64 + string swap 2 take dup last string 4 r dump + 'A split

`
code = `
100 range { dup 2 / swap  2.0 / - 0 = } filter 100 range {,} zipwith transpose dump {+} zipwith 2 slice {max} map sum 
`

code = `

17 {dup 2 % {3 * 1 + } { 2 / } ifelse} 10 iteraten

`
code = `

"Ut tempora neque labore dolorem magnam non t&empora.,Magnam voluptatem &sit quiquia sit dolore.,Non tempor&a aliquam etincidunt quiquia labore neque ut.,Velit dolor& aliquam modi sed."

', split { '& split {length} map} map transpose {dup min swap max ,} map dump {+} zipwith product
`

let g = new Glang(code)

a = 0
b = 1



g.run()


console.log(g.stack.pretty())
console.log(g.stack.top())