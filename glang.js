const Stack = require("./stack.js")
const functions = require("./functions.js")
const parse = require("./parser.js")

const isLiteral = token => ["int", "float", "char", "string", "block"].includes(token.type)




class Glang {
    constructor(code){
        this.code = code
        this.stack = new Stack()
        this.commands = parse(code)
        this.output = console.log
    }
    doCommand(command){
        if(isLiteral(command)){
            this.stack.push(command)
            return
        }
        let func = functions[command.value]
        if(func){
            func(this.stack, this)
            return
        }
        console.error(`"${command.value}" has no function, skipping`)
        // throw new Error(`${command.value} has no function`)
    }
}

module.exports = {Glang}