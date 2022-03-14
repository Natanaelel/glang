const functions = require("./functions.js")
const parse = require("./parser.js")

const isLiteral = token => ["int", "float", "char", "string", "block"].includes(token.type)


class Stack {
    constructor(){
        this.stack = []
    }
    pop(num = 0){
        if(num == 0){
            return this.stack.pop()
        }
        return this.stack.splice(-num)
    }
    peek(num = 0){
        if(num == 0){
            return this.stack[this.stack.length - 1]
        }
        return this.stack.slice(-num)
    }
    push(value){
        this.stack.push(value)
    }
    concat(values){
        this.stack = this.stack.concat(values)
    }
}


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
        throw new Error(`${command.value} has no function`)
    }
}

module.exports = {Glang}