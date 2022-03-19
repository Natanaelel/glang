const { Glang } = require("./glang.js")

let code = `
	1 10 3 r { 1 + } map { range } map dump max + dump wrap dup length swap {60 + } map 26 range 64 + string swap 2 take dup last string 4 r dump + 'A split

`
code = `
100 range { dup 2 / swap  2.0 / - 0 = } filter 100 range {,} zipwith transpose dump {+} zipwith 2 slice {max} map sum 
`

code = ` 100000 range {{dup 2 % {3 * 1 + } { 2 / } ifelse} { 1 >} iteratewhile length} maxby` //collatz conjecture
code = ` 77031 {dup odd {3 * 1 + } { 2 / } ifelse} { 1 >} iteratewhile max` //collatz conjecture
code = ` 77031 {dup odd {3 * 1 + } { 2 / } ifelse} { 1 >} iteratewhile` //collatz conjecture
code = `24 20 10 wrap reverse dump dup * swap dup * + swap 2 / ^`
code = `
"10,1,44,74,55,49,15,44,67,39,95,76,11,18,82,73,48,14,91,61,32,44,19,59,32,26,38,66,44,67,88,33,35,81,88,61,8,99,99,47,42,70,53,27,13,66,58,27,7,92,69,36,37,25,22,24,5,13,37,17,44,43,74,38,22,91,13,34"
', split {int} map { , max} scan uniq length

`
code = `"0CF70000010900010C0197" 
10 rotate 4 slice 4 take {hex} map reverse dump even swap dup 2 % 2 16 ^ * - wrap product 100.0 / `

"10r4s4thmrdesd2%16^*-wp100/"
"T._4ô4£HR`ÈsD2%16o*-Pт/J0+"
let g = new Glang(code)

a = 0
b = 1



g.run()


console.log(g.stack)
console.log(g.stack.pretty())
console.log("")
console.log(g.stack.top())