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
        this.log = typeof settings.logfunction == "function" ? settings.logfunction : (() => console.log(this.stack.pretty()))
    }
    doCommand(command){
        if(isLiteral(command)){
            this.stack.push(command)
            if(this.settings.debug) this.log(this, command)
            return this
        }
        let func = ([...command.value].length == 1 ? functions_compact: functions)[command.value]
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
        for(let command of this.commands){
            this.doCommand(command)
        }
        return this
    }
}

module.exports = {Glang}