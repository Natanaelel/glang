class Stack {
    constructor(){
        this.stack = []
    }
    pop(num = 0){
        if(num == 0){
            if(this.stack.length == 0){
                console.error("popping from empty stack, returning 0")
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
    pretty(self = this.stack){
        const show = a => {
            if(a === undefined || a === null) return `nil`
            if(a.type == "list") return `[${a.value.map(show).join(", ")}]`
            if(a.type == "string") return `"${a.value.replace(/.|\s/g, m => {
                if(m == "\n") return "\\n"
                if(m == "\r") return "\\r"
                if(m == "\f") return "\\f"
                if(m == '"') return '\\"'
                if(m == "\\") return "\\\\"
                return m
            })}"`
            if(a.type == "char") return `'${a.value}'`
            if(a.type == "block") return `{${a.value.map(show).join(" ")}}`
            return `${a.value}`
        }
        return Array.isArray(self) ? `[${self.map(show).join(", ")}]` : show(self)
    }
    clear(){
        this.stack = []
    }
    top(){
        return this.pretty(this.peek())
    }
}

module.exports = Stack