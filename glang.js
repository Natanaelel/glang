const Stack = require("./stack.js")
const { functions, functions_compact} = require("./functions.js")
const parse = require("./parser.js")

const isLiteral = token => ["int", "float", "char", "string", "block"].includes(token.type)




class Glang {
    /**
     * @param {String} code
     * @param { {verbose: bool} } settings
     */
    constructor(code, settings = {} ){
        this.code = code
        this.settings = settings
        this.stack = new Stack()
        this.commands = parse(this.code, this.settings)
        this.output = console.log
    }
    doCommand(command){
        if(isLiteral(command)){
            this.stack.push(command)
            return this
        }
        let func = ([...command.value].length == 1 ? functions_compact: functions)[command.value]
        if(func){
            func(this.stack, this)
            return this
        }
        console.error(`"${command.value}" has no function, skipping`)
        // throw new Error(`${command.value} has no function`)
        return this
    }
    run(){
        for(let command of this.commands){
            this.doCommand(command)
        }
        return this
    }
}

module.exports = {Glang}