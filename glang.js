const Stack = require("./stack.js")
const { functions, functions_compact} = require("./functions.js")
const parse = require("./parser.js")


const { GInt, GFloat, GString, GList, GBlock } = require("./types.js")

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
        this.log = typeof settings.logfunction == "function" ? settings.logfunction : (() => console.log(this.stack.pretty()))
    }
    doCommand(command){
        if(isLiteral(command)){
            this.stack.push(command)
            if(this.settings.debug) this.log(this, command)
            return this
        }
        let func = ([...command.value].length == 1 ? functions_compact : functions)[command.value]
        if(func){
            func(this.stack, this)
            if(this.settings.debug) this.log(this, command)
            return this
        }
        if(this.settings.warnings) console.log(`"${command.value}" has no function, skipping`)
        // throw new Error(`${command.value} has no function`)
        if(this.settings.debug) this.log(this, command)
        return this
    }
    run(){
        // do each command
        for(let command of this.commands){
            if(command.value == "quit" || command.value == "q") break
            this.doCommand(command)
        }

        // evaluate every item on the stack
        // transform every lazy list to vanilla array
        for(let i = 0; i < this.stack.stack.length; i++){
            let value = this.stack.stack[i]
            if(value instanceof GList){
                if(!value.isFullyEvaluated()){
                    // value.to_array_deep()
                    this.stack.stack[i].force_evaluate_deep()
                    i = 0
                    console.log("redo")
                    console.log(this.stack.stack)
                }
            }
        }

        return this
    }
}

module.exports = {
    Glang
}