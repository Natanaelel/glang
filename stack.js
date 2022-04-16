const { GInt, GFloat, GString, GList, GBlock } = require("./types.js")


class Stack {
    constructor(settings = {}){
        this.stack = []
        this.settings = settings
    }
    pop(num = 0){
        if(num == 0){
            if(this.stack.length == 0){
                if(this.settings.warnings) console.error("popping from empty stack, returning 0")
                return new GInt(0n)
            }
            return this.stack.pop()
        }
        if(this.stack.length >= num) return this.stack.splice(-num)
        let result = []
        for(let i = 0; i < num; i++) result.push(this.pop())
        return result
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
    pretty(self = this.stack, evaluated = false){
        if(!evaluated){
            if(Array.isArray(self)){
                self.map(x => x?.to_array_deep?.() ?? x)
                // return this.pretty(self, true)
            }else if(self?.type == "list"){
                self.to_array_deep()
            }
            return this.pretty(self, true)
        }
        const show = a => {
            if(a === undefined || a === null) return `nil`
            // if(Array.isArray(a)) return `[${a.map(x => x.toRawString?.() ?? x.toString()).join(", ")}]`
            if(Array.isArray(a)) return `[${a.map(show).join(", ")}]`
            if(a.type == "string") return a.toRawString()
            if(a.type == "int") return a.toRawString()
            if(a.type == "float") return a.toRawString()
            if(a.type == "list") return `[${a.to_array().map(show).join(", ")}]`
            if(a.type == "block") return `{${a.value.map(show).join(" ")}}`
            return `${a.value}`
        }
        // if(typeof self == "string" || self instanceof String) return self
        return show(self)
    }
    clear(){
        this.stack = []
    }
    // top(){
    //     return this.pretty(this.peek())
    // }
        
    top(evaluated = false){
        if(!evaluated){
            this.stack.map(x => x?.to_array_deep?.() ?? x)
            return this.top(true)
        }
        const show = a => {
            if(a === undefined || a === null) return `nil`
            if(Array.isArray(a)) return `[${a.map(show).join(", ")}]`
            if(a.type == "string") return a.toString()
            if(a.type == "int") return a.toString()
            if(a.type == "float") return a.toString()
            if(a.type == "list") return `[${a.to_array().map(show).join(", ")}]`
            if(a.type == "block") return `{${a.value.map(show).join(" ")}}`
            return `${a.value}`
        }
        return show(this.peek())
    }
    raw(){
        const show = e => {
            if(e.type == "list") return e.value.map(show)
            return e.type
        }
        return JSON.stringify(this.stack.map(show), null, 2)
    }
}

module.exports = Stack