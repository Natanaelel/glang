const Stack = require("./stack.js")

const defs = require("./defs.js")


const toInt = a => ({"type": "int", "value": parseInt(a)})
const toFloat = a => ({"type": "float", "value": parseFloat(a)})
const toString = a => ({"type": "string", "value": `${a}`})
const toChar = a => ({"type": "char", "value": `${a}`[0]})
const toList = a => ({"type": "list", "value": a})


const isNumber = token => token.type == "int" || token.type == "float"
const isInt = token => token.type == "int"
const isString = token => token.type == "string"
const isChar = token => token.type == "char"
const isStringy = token => token.type == "string" || token.type == "char"
const isList = token => token.type == "list"
const isListy = token => token.type == "list" || token.type == "string"
const isBlock = token => token.type == "block"

const applyTo = (func, ret_type) => (a, b) => ({"type": ret_type, "value": func(a.value, b.value)})


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
            let error_msg = `can't use function "${func.name}" on ${args}`
            console.error(error_msg)
            console.error(args)
            throw new Error(error_msg)
            return
        }
        if(output == 1){
            stack.push(result)
        }
        else{
            stack.concat(result)
        }
    }
}

const arity_c = (func, num_inputs, return_type) => {
    return stack => {
        let args = stack.pop(num_inputs).map(e => e.value)
        let result = func(...args)
        stack.push({
            "type": return_type,
            "value": glang_parse(result)
        })
    }
}

const glang_parse = (obj) => {
    if(`${obj}` === obj){
        return {
            "type": "string",
            "value": obj
        }
    }
    if(/^\d+$/.test(`${obj}`)){
        return {
            "type": "int",
            "value": obj
        }
    }
    if(/^\d+\.\d+$/.test(`${obj}`)){
        return {
            "type": "float",
            "value": obj
        }
    }
    if(Array.isArray(obj)){
        return {
            "type": "list",
            "value": obj.map(glang_parse)
        }
    }
    throw new Error(`could't parse ${obj}`)
}

const range = (a) => {
    if(isNumber(a)){
        return toList(defs.range(a.value).map(toInt))
    }
}
const map = (stack, self) => {
    let b = stack.pop()
    let a = stack.pop()
    
    if(a.type != "list" || b.type != "block") return
    
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

}
const filter = (stack, self) => {
    let a = stack.pop()
    let b = stack.pop()
    if(isList(a) && isBlock(b)){
        let result = []
        for(let value of a.value){
            stack.push(value)
            applyBlock(block, stack, self)
            let pred = stack.pop()
            if(isTruthy(pred)){
                result.push(value)
            }
        }
        stack.push(toList(result))
        return
    }
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
module.exports = {
    "+": arity(plus, 2, 1),
    "-": arity(minus, 2, 1),
    "*": arity(multiply, 2, 1),
    "/": arity(divide, 2, 1),
    "@": apply,
    "r": arity(repeat, 2, 1),
    "range": arity(range, 1, 1),
    map,
    filter,
    "length": arity(length, 1, 1),
    "dup": arity(dup, 1, 2),
    "max": arity(max, 1, 1),
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
    "=": arity(equals, 2, 1)
}