const Stack = require("./stack.js")

const defs = require("./defs.js")


const toInt = a => ({"type": "int", "value": parseInt(a)})
const toFloat = a => ({"type": "float", "value": parseFloat(a)})
const toString = a => ({"type": "string", "value": `${a}`})
const toChar = a => ({"type": "char", "value": `${a}`[0]})
const toList = a => ({"type": "list", "value": a})


const isInt = token => token.type == "int"
const isFloat = token => token.type == "float"
const isNumber = token => token.type == "int" || token.type == "float"
const isString = token => token.type == "string"
const isChar = token => token.type == "char"
const isStringy = token => token.type == "string" || token.type == "char"
const isList = token => token.type == "list"
const isListy = token => token.type == "list" || token.type == "string"
const isBlock = token => token.type == "block"

const error = (name, ...params) => {
    console.error(`function ${name} doesn't take parameters ${params.map(e => e.type).join(", ")}`)
    // process.exit()
}

const applyBlock = (block, stack, self) => {
    for(let command of block.value){
        self.doCommand(command)
    }
}

const isTruthy = (a) => {
    return !isFalsy(a)
}
const isFalsy = (a) => {
    if(isString(a)) return a.value === ""
    if(isInt(a)) return a.value === 0
    if(isFloat(a)) return a.value === 0.0
    if(isList(a)) return a.value.length === 0
    if(isBlock(a)) return  false // idk if block, now block yes
    console.error(a)
    throw new Error("what kind of value is this?!")
}
const plus = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value + b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.value + b.value)
    if(isNumber(a) && isList(b)) return toList(b.value.map(e => plus(e, a)))
    if(isList(a) && isNumber(b)) return toList(a.value.map(e => plus(e, b)))
    // if(isList(a) && isList(b)) return toList(a.value.map((e, i) => plus(e, b[i]))) // vectorizes
    if(isList(a) && isList(b)) return toList(a.value.concat(b.value)) // concat
    if(isString(a) && isString(b)) return toString(a.value + b.value)
    throw new Error(`can't use ${"+"} on ${a.type} and ${b.type}`)
}
const minus = (a, b) => {
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value - b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value - b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.value.map(e => minus(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.value.map(e => minus(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.value.map((e, i) => minus(e, b[i]))}
    throw new Error(`can't use ${"-"} on ${a.type} and ${b.type}`)
}
const multiply = (a, b) => {
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value * b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value * b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.value.map(e => multiply(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.value.map(e => multiply(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.value.map((e, i) => multiply(e, b[i]))}
    throw new Error(`can't use ${"*"} on ${a.type} and ${b.type}`)
}
const divide = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value / b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.value / b.value)
    if(isNumber(a) && isList(b)) return toList(b.value.map(e => divide(e, a)))
    if(isList(a) && isNumber(b)) return toList(a.value.map(e => divide(e, b)))
    if(isList(a) && isList(b)) return toList(a.value.map((e, i) => divide(e, b[i])))
    throw new Error(`can't use ${"/"} on ${a.type} and ${b.type}`)
}
const mod = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value % b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.value % b.value)
    if(isNumber(a) && isList(b)) return toList(b.value.map(e => mod(e, a)))
    if(isList(a) && isNumber(b)) return toList(a.value.map(e => mod(e, b)))
    if(isList(a) && isList(b)) return toList(a.value.map((e, i) => mod(e, b[i])))
    throw new Error(`can't use % on ${a.type} and ${b.type}`)
}
const apply = (stack, self) => {
    let func = stack.pop()
    for(let command of func.value){
        self.doCommand(command)
    }
}

const repeat = (a, b) => {
    console.log(a,b)
    return {
        "type": "list",
        "value": Array(b.value).fill(a)
    }
}


const arity = (func, input, output) => {
    return stack => {
        let args = stack.pop(input)
        let result = func(...args)
        if(result === undefined){
            // let error_msg = `can't use function "${func.name}" on ${args}`
            // console.error(error_msg)
            // console.error(args)
            // throw new Error(error_msg)
            // return
            error(func.name, ...args)
        }
        if(output == 1){
            stack.push(result)
        }
        else{
            stack.concat(result)
        }
    }
}



const range = (a) => {
    if(isNumber(a)){
        return toList(defs.range(a.value).map(toInt))
    }
    error("range", a)
}
const map = (stack, self) => {
    let b = stack.pop()
    let a = stack.pop()
    
    if(a.type == "list" && b.type == "block"){
        let result = []

        for(let element of a.value){
            // let stack = new Stack()
            stack.push(element)
            for(let command of b.value){
                // console.log(command)
                self.doCommand(command)
            }
            result.push(stack.pop())
        }
        stack.push({
            "type": "list",
            "value": result
        })
        return
    }
    error("map", a, b)
}
const filter = (stack, self) => {
    let b = stack.pop()
    let a = stack.pop()
    if(isList(a) && isBlock(b)){
        let result = []
        for(let value of a.value){
            stack.push(value)
            applyBlock(b, stack, self)
            let pred = stack.pop()
            if(isTruthy(pred)){
                result.push(value)
            }
        }
        stack.push(toList(result))
        return
    }
    error("filter", a, b)
}

const zipwith = (stack, self) => {
    let c = stack.pop()
    let b = stack.pop()
    let a = stack.pop()
    if(isList(a) && isList(b) && isBlock(c)){
        let length = Math.min(a.value.length, b.value.length)
        let result = []
        for(let i = 0; i < length; i++){
            stack.push(a.value[i])
            stack.push(b.value[i])
            applyBlock(c, stack, self)
            result.push(stack.pop())
        }
        stack.push(toList(result))
        return
    }
    error("zipwith", a, b, c)
}

const dump = (stack) => {
    let a = stack.pop()
    if(!isList(a)) return stack.push(a)
    stack.concat(a.value)
}
const length = (a) => {
    if(isString(a)) return toInt(a.value.length)
    if(isList(a)) return toInt(a.value.length)
    if(isNumber(a)) return toInt(a.value.toString().length)

}
const dup = (a) => [a, a]
const max = (a) => defs.max_by(a.value, e => e.value)
const min = (a) => defs.max_by(a.value, e => -e.value)
const wrap = (stack) => {
    let stack_content = [...stack.stack]
    stack.clear()
    stack.push(toList(stack_content))
}
const string = (a) => {
    if(isList(a)) return toString(String.fromCharCode(...a.value.map(e => e.value)))
    if(isInt(a)) return toString(String.fromCharCode(a.value))
}
const swap = (a, b) => [b, a]
const take = (a, b) => {
    return toList(a.value.slice(0, b.value))
}
const drop = (a, b) => {
    return toList(a.value.slice(b.value))
}
const head = (a) => {
    if(isString(a)) return toString(a.value[0])
    if(isList(a)) return a.value[0]
}
const last = (a) => {
    if(isString(a)) return toString(a.value[a.value.length - 1])
    if(isList(a)) return a.value[a.value.length - 1]
}
const split = (a, b) => {
    if(isString(a) && isString(b)) return toList(a.value.split(b.value).map(toString))
}
const pair = (a, b) => {
    return toList([a, b])
}
const equals = (a, b) => {

    let true_val = toInt(1)
    let false_val = toInt(0)

    if(isNumber(a) && isNumber(b)) return a.value == b.value ? true_val : false_val
    if(a.type != b.type) return false_val
    // from now, types are same
    if(isList(a)){
        if(a.value.length != b.value.length) return false_val
        for(let i = 0; i < a.value.length; i++){
            if(!equals(a.value[i], b.value[i])) return false_val
        }
        return true_val
    }
    console.error(a)
    console.error(b)
    throw new Error(" whtat type ?!?!?!")
}
const transpose = (a) => {
    if(isList(a) && isList(a.value[0])){ // is at least 2d
        let min_length = Math.min(...a.value.map(e => e.value.length))
        let raw_transposed = Array(min_length).fill().map((_,i)=>a.value.map(r=>r.value[i]))
        let glangified = toList(raw_transposed.map(toList))
        return glangified
    }
    return
}
const slice = (a, b) => {
    if(!isNumber(b)) return
    if(isList(a)){
        let result = []
        for(let i = 0; i < a.value.length; i += b.value){
            result.push(a.value.slice(i, i + b.value))
        }
        return toList(result.map(toList))
    }
    if(isString(a)){
        let result = []
        for(let i = 0; i < a.value.length; i += b.value){
            result.push(a.value.slice(i, i + b.value))
        }
        return toList(result.map(toString))
    }
}

const sum = (a) => {
    if(isList(a)){
        if(isInt(a.value[0])){
            return toInt(a.value.reduce((x, y) => x + y.value, 0))
        }
        if(isFloat(a.value[0])){
            return toFloat(a.value.reduce((x, y) => x + y.value, 0))
        }
    }
}
const product = (a) => {
    if(isList(a)){
        if(isInt(a.value[0])){
            return toInt(a.value.reduce((x, y) => x * y.value, 1))
        }
        if(isFloat(a.value[0])){
            return toFloat(a.value.reduce((x, y) => x * y.value, 1))
        }
    }
}
const iteraten = (stack, self) => {
    // any, func, iterations
    let c = stack.pop()
    let b = stack.pop()
    let a = stack.pop()
    if(isBlock(b) && isInt(c)){
        let val = a
        let result = [val]
        console.log(c)
        for(let i = 0; i < c.value; i++){
            stack.push(val)
            applyBlock(b, stack, self)
            val = stack.pop()
            result.push(val)
        }
        stack.push(toList(result))
        return
    }
    error("iteraten", a, b, c)
}
const ifelse = (stack, self) => {
    // "true {yes} {no} ifelse" => yes 
    let c = stack.pop() // func, false
    let b = stack.pop() // func, true
    let a = stack.pop() // val
    if(isBlock(b) && isBlock(c)){
        if(isTruthy(a)){
            applyBlock(b, stack, self)
        }
        else{
            applyBlock(c, stack, self)
        }
        return
    }
    error("ifelse", a, b, c)
}
module.exports = {
    "+": arity(plus, 2, 1),
    "-": arity(minus, 2, 1),
    "*": arity(multiply, 2, 1),
    "/": arity(divide, 2, 1),
    "%": arity(mod, 2, 1),
    "@": apply,
    "r": arity(repeat, 2, 1),
    "range": arity(range, 1, 1),
    map,
    filter,
    "length": arity(length, 1, 1),
    "dup": arity(dup, 1, 2),
    "max": arity(max, 1, 1),
    "min": arity(min, 1, 1),
    dump,
    wrap,
    "string": arity(string, 1, 1),
    "swap": arity(swap, 2, 2),
    "take": arity(take, 2, 1),
    "drop": arity(drop, 2, 1),
    "head": arity(head, 1, 1),
    "last": arity(last, 1, 1),
    "split": arity(split, 2, 1),
    "pair": arity(pair, 2, 1),
    ",": arity(pair, 2, 1),
    "=": arity(equals, 2, 1),
    zipwith,
    "transpose": arity(transpose, 1, 1),
    "slice": arity(slice, 2, 1),
    "sum": arity(sum, 1, 1),
    "product": arity(product, 1, 1),
    iteraten,
    ifelse,
}