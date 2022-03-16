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
    pretty(){
        const show = a => {
            if(a.type == "list") return `[${a.value.map(show).join(", ")}]`
            if(a.type == "string") return `"${a.value}"`
            if(a.type == "char") return `'${a.value}'`
            if(a.type == "block") return `{${a.value.map(show).join(" ")}}`
            return `${a.value}`
        }
        return `[${this.stack.map(show).join(", ")}]`
    }
    clear(){
        this.stack = []
    }
}

module.exports = Stack