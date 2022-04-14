class Stack {
    constructor(settings = {}){
        this.stack = []
        this.settings = settings
    }
    pop(num = 0){
        if(num == 0){
            if(this.stack.length == 0){
                if(this.settings.warnings) console.error("popping from empty stack, returning 0")
                return {"type": "int", "value": 0}
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
    // pretty(self = this.stack){
    //     const show = a => {
    //         if(a === undefined || a === null) return `nil`
    //         if(a.type == "list") return `[${a.value.to_array().map(show).join(", ")}]`
    //         if(a.type == "string") return `"${a.value.toString().replace(/.|\s/g, m => {
    //             if(m == "\n") return "\\n"
    //             if(m == "\r") return "\\r"
    //             if(m == "\f") return "\\f"
    //             if(m == '"') return '\\"'
    //             if(m == "\\") return "\\\\"
    //             return m
    //         })}"`
    //         if(a.type == "block") return `{${a.value.map(show).join(" ")}}`
    //         return `${a.value}`
    //     }
    //     if(Array.isArray(self)) return `[${self.map(show).join(", ")}]`
    //     if(self.type == "string") return self.value.toString()
    //     // if(typeof self == "string" || self instanceof String) return self
    //     return show(self)
    // }
    pretty(self = this.stack){
            const show = a => {
                if(a === undefined || a === null) return `nil`
                if(Array.isArray(a)) return `[${a.map(x => x.toRawString?.() ?? x.toString()).join(", ")}]`

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
    top(){
        return this.pretty(this.peek())
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