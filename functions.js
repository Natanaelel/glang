const Stack = require("./stack.js")

const defs = require("./defs.js")

const { XMLHttpRequest } = require("xmlhttprequest")

// const { Lazylist } = require("@natanalel/lazylist")
const { Lazylist } = require("./infinitely_lazy/lazylist.js")


const toInt = a => ({"type": "int", "value": parseInt(a)})
const toFloat = a => ({"type": "float", "value": parseFloat(a)})
const toString = a => ({"type": "string", "value": `${a}`})
const toList = a => ({"type": "list", "value": a})

const deepClone = a => {
    if(a.type == "int") return toInt(a.value)
    if(a.type == "float") return toFloat(a.value)
    if(a.type == "string") return toString(a.value)
    if(a.type == "list") return toList(a.value.map(deepClone))
    throw new Error("what type in deepclone what?!")
}


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

const stringify = (a) => {
    if(isString(a)) return a.value
    if(isNumber(a)) return toString(a.value).value
    if(isList(a)) return `[${a.value.map(x => stringify(x)).join(", ")}]`
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
    throw new Error(`can't use ${"%"} on ${a.type} and ${b.type}`)
}
const power = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value ** b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.value ** b.value)
    if(isNumber(a) && isList(b)) return toList(b.value.map(e => mod(e, a)))
    if(isList(a) && isNumber(b)) return toList(a.value.map(e => mod(e, b)))
    if(isList(a) && isList(b)) return toList(a.value.map((e, i) => mod(e, b[i])))
    throw new Error(`can't use ${"^"} on ${a.type} and ${b.type}`)
}
const apply = (stack, self) => {
    let func = stack.pop()
    for(let command of func.value){
        self.doCommand(command)
    }
}

const repeat = (a, b) => {
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
const dup = (a) => [deepClone(a), deepClone(a)]
const over = (a, b) => [a, b, deepClone(a)]
const max = (a) => defs.max_by(a.value, e => e.value)
const min = (a) => defs.max_by(a.value, e => -e.value)
const wrap = (stack) => {
    let stack_content = [...stack.stack]
    stack.clear()
    stack.push(toList(stack_content))
}
const wrapN = (stack) => {
    let num = stack.pop()
    if(!isNumber(num)) return error("wrapN", num)
    // let num_num = 
    // let wrapped = stack.stack.slice(-num_num)
    // stack.stack.splice(num_num, num_num)
    stack.push(toList(stack.pop(parseInt(num.value))))
}
const string = (a) => {
    if(isList(a)) return toString(String.fromCharCode(...a.value.map(e => e.value)))
    if(isInt(a)) return toString(String.fromCharCode(a.value))
}
const swap = (a, b) => [b, a]
const take = (a, b) => {
    if(isList(a) && isInt(b)) return toList(a.value.slice(0, b.value))
    if(isString(a) && isInt(b)) return toString(a.value.slice(0, b.value))
}
const drop = (a, b) => {
    if(isList(a) && isInt(b)) return toList(a.value.slice(b.value))
    if(isString(a) && isInt(b)) return toString(a.value.slice(b.value))
}
const head = (a) => {
    if(isString(a)) return toString(a.value[0])
    if(isList(a)) return a.value[0]
}
const tail = (a) => {
    if(isString(a)) return toString(a.value.slice(1))
    if(isList(a)) return toList(a.value.slice(1))
}
const init = (a) => {
    if(isString(a)) return toString(a.value.slice(0, -1))
    if(isList(a)) return toList(a.value.slice(0, -1))
}
const last = (a) => {
    if(isString(a)) return toString(a.value[a.value.length - 1])
    if(isList(a)) return a.value[a.value.length - 1]
}
const split = (a, b) => {
    if(isString(a) && isString(b)) return toList(a.value.split(b.value).map(toString))
}
const join = (a, b) => {
    if(isString(b)){
        if(isString(a)) return a
        if(isList(a)) return toString(a.value.map(x => join(x, b).value).join(b.value))
        return toString(stringify(a))
    }
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

    if(isString(a)) return a.value === b.value ? true_val : false_val

    if(isList(a)){
        if(a.value.length != b.value.length) return false_val
        for(let i = 0; i < a.value.length; i++){
            if(equals(a.value[i], b.value[i]).value == 0) return false_val
        }
        return true_val
    }
    console.error(a)
    console.error(b)
    throw new Error(" whtat type ?!?!?!")
}
const less_than = (a, b) => {
    let true_val = toInt(1)
    let false_val = toInt(0)
    if(isNumber(a) && isNumber(b)) return a.value < b.value ? true_val : false_val
}
const greater_than = (a, b) => {
    let true_val = toInt(1)
    let false_val = toInt(0)
    if(isNumber(a) && isNumber(b)) return a.value > b.value ? true_val : false_val
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
        return a.value.reduce((x, y) => plus(x, y))
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
const iteratewhile = (stack, self) => {
    let c = stack.pop() // condition
    let b = stack.pop() // iter
    let a = stack.pop() // value
    if(isBlock(b) && isBlock(c)){
        let val = a
        let result = []
        const doCheck = () => {
            stack.push(val)
            applyBlock(c, stack, self)
            let pred_result = stack.pop()
            return isTruthy(pred_result)
        }
        while(doCheck()){
            result.push(val)
            stack.push(val)
            applyBlock(b, stack, self)
            val = stack.pop()
        }   
        stack.push(toList(result))
        return
    }
    error("iteratewhile", a, b, c)
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
const pop = (stack) => {
    stack.pop()
}
const reverse = (a) => {
    if(isList(a)) return toList(a.value.reverse())
    if(isString(a)) return toString(a.value.split("").reverse().join(""))
}
const zip = (a, b) => {
    if(isList(a) && isList(b)){
        let min_length = Math.min(a.value.length, b.value.length)
        return toList(a.value.slice(0, min_length).map((e, i) => toList([e, b.value[i]])))
    }
}
const hex = (a) => {
    if(isString(a)){
        return toInt(parseInt(a.value, 16))
    }
}
const odd = (a) => {
    if(isNumber(a)) return toInt(a.value % 2 === 1 ? 1 : 0)
}
const even = (a) => {
    if(isNumber(a)) return toInt(a.value % 2 === 0 ? 1 : 0)
}
const rotate = (a, b) => {
    if(!isInt(b)) return
    if(isList(a)){
        let length = a.value.length
        let steps = ((b.value % length) + length) % length // posistive mod length
        return toList(a.value.slice(steps).concat(a.value.slice(0, steps)))
    }
    if(isString(a)){
        let length = a.value.length
        let steps = ((b.value % length) + length) % length // posistive mod length
        return toString(a.value.slice(steps).concat(a.value.slice(0, steps)))
    }
}
const maxby = (stack, self) => {
    let b = stack.pop() // arr
    let a = stack.pop() // func

    if(isList(a) && isBlock(b)){
        let result = defs.max_by(a.value, e => {
            stack.push(e)
            applyBlock(b, stack, self)
            return stack.pop().value
        })
        stack.push(result)
        return
    }


    error("maxby", a, b)
}
const minby = (stack, self) => {
    let b = stack.pop() // arr
    let a = stack.pop() // func

    if(isList(a) && isBlock(b)){
        let result = defs.min_by(a.value, e => {
            stack.push(e)
            applyBlock(b, stack, self)
            return stack.pop().value
        })
        stack.push(result)
        return
    }


    error("minby", a, b)
}
const range_from_to = (a, b) => {
    if(isInt(a) && isInt(b)){
        let result = []
        let diff = a.value < b.value ? 1 : -1
        for(let i = a.value; i != b.value; i += diff){
            result.push(toInt(i))
        }
        result.push(toInt(b.value))
        return toList(result)
    }
}
const divisors = (a) => {
    if(isInt(a)){
        return toList(defs.range(a.value).filter(e => a.value % e == 0).map(toInt))
    }
}
const at = (a, b) => { // modular indexing
    if(isList(a) && isInt(b)){
        let length = a.value.length
        return a.value[(b.value % length + length) % length]
    }
}
const fold = (stack, self) => {
    let b = stack.pop() // block
    let a = stack.pop() // arr

    if(isList(a) && isBlock(b)){
        if(a.value.length == 0){ // if empty, push 0
            stack.push(toInt(0))
            return
        }
        let val = a.value[0]
        for(let i = 1; i < a.value.length; i++){
            stack.push(val)
            stack.push(a.value[i])
            applyBlock(b, stack, self)
            val = stack.pop()
        }
        stack.push(val)
        return
    }

    error("fold", a, b)
}
const scan = (stack, self) => {
    let b = stack.pop() // block
    let a = stack.pop() // arr

    if(isList(a) && isBlock(b)){
        if(a.value.length == 0){ // if empty, push []
            stack.push(toList([]))
            return
        }
        let val = a.value[0]
        let result = [val]
        for(let i = 1; i < a.value.length; i++){
            stack.push(val)
            stack.push(a.value[i])
            applyBlock(b, stack, self)
            val = stack.pop()
            result.push(val)
        }
        stack.push(toList(result))
        return
    }

    error("scan", a, b)
}
const int = (a) => {
    if(isList(a)) return
    return toInt(a.value)
}
const uniq = (a) => {
    if(isList(a)){
        if(a.value.every(isInt)){
            return toList([...new Set(a.value.map(e => e.value))].map(toInt))
        }
        if(a.value.every(isFloat)){
            return toList([...new Set(a.value.map(e => e.value))].map(toFloat))
        }
        if(a.value.every(isString)){
            return toList([...new Set(a.value.map(e => e.value))].map(toString))
        }
    }
}

const web_get = (url) => {
    if(!isString(url)) return
    let request = new XMLHttpRequest()
    request.open("GET", url.value, false)
    request.send()
    if(request.status != 200){
        console.error(request.status)
    }
    let text = request.responseText
    return toString(text ?? "")
}
const sign = (a) => {
    if(isNumber(a)) return toInt(a.value == 0 ? 0 : a.value > 0 ? 1 : -1)
}
const not = (a) => {
    return toInt(isTruthy(a) ? 0 : 1)
}
const count = (stack, self) => {
    let b = stack.pop() // block or element
    let a = stack.pop() // arr or string

    if(isList(a) || isString(a)){
        let count_num = 0
        for(let i = 1; i < a.value.length; i++){
            if(isBlock(b)){
                stack.push(a.value[i])
                applyBlock(b, stack, self)
                val = stack.pop()
                if(isTruthy(val)) count_num++
            }else{
                if(isTruthy(equals(a.value[i], b))) count_num++
            }
        }
        stack.push(toInt(count_num))
        return
    }

    error("count", a, b)
}
const index = (a, b) => {
    if(isList(a)){
        for(let i = 0; i < a.value.length; i++){
            if(equals(a.value[i], b).value == 1) return toInt(i)
        }
        return toInt(-1)
    }
    if(isString(a)){
        for(let i = 0; i < a.value.length; i++){
            if(equals(toString(a.value[i]), b).value == 1) return toInt(i)
        }
        return toInt(-1)
    }
    return
}
const chr = (a) => {
    if(isNumber(a)) return toString(String.fromCharCode(Math.floor(a.value)))
    if(isList(a)) return toList(a.value.map(chr))
}
const ord = (a) => {
    if(isString(a)){
        if([...a.value].length == 1){ // return single int
            return toInt(a.value.charCodeAt())
        }
        return toList(a.value.map(x => toInt(x.charCodeAt()))) // return codepoint list
    }
    if(isList(a)) return toList(a.value.map(ord))
}
const chars = (a) => {
    if(isString(a)) return toList([...a.value].map(toString))
}
const elem = (a, b) => {
    if(isList(a)){
        for(let i = 0; i < a.value.length; i++){
            if(equals(a.value[i], b).value == 1) return toInt(1)
        }
        return toInt(0)
    }
    if(isString(a)){
        for(let i = 0; i < a.value.length; i++){
            if(equals(toString(a.value[i]), b).value == 1) return toInt(1)
        }
        return toInt(0)
    }
    return
}


const functions = {
    "+": arity(plus, 2, 1),
    "-": arity(minus, 2, 1),
    "*": arity(multiply, 2, 1),
    "/": arity(divide, 2, 1),
    "%": arity(mod, 2, 1),
    "^": arity(power, 2, 1),
    "@": apply,
    "apply": apply,
    "repeat": arity(repeat, 2, 1),
    "range": arity(range, 1, 1),
    map,
    filter,
    "length": arity(length, 1, 1),
    "dup": arity(dup, 1, 2),
    "over": arity(over, 2, 3),
    "max": arity(max, 1, 1),
    "min": arity(min, 1, 1),
    dump,
    wrap,
    wrapN,
    "string": arity(string, 1, 1),
    "swap": arity(swap, 2, 2),
    "take": arity(take, 2, 1),
    "drop": arity(drop, 2, 1),
    "head": arity(head, 1, 1),
    "tail": arity(tail, 1, 1),
    "init": arity(init, 1, 1),
    "last": arity(last, 1, 1),
    "split": arity(split, 2, 1),
    "join": arity(join, 2, 1),
    "pair": arity(pair, 2, 1),
    ",": arity(pair, 2, 1),
    "=": arity(equals, 2, 1),
    "<": arity(less_than, 2, 1),
    ">": arity(greater_than, 2, 1),
    zipwith,
    "transpose": arity(transpose, 1, 1),
    "slice": arity(slice, 2, 1),
    "sum": arity(sum, 1, 1),
    "product": arity(product, 1, 1),
    iteraten,
    iteratewhile,
    ifelse,
    pop,
    "reverse": arity(reverse, 1, 1),
    "zip": arity(zip, 2, 1),
    "hex": arity(hex, 1, 1),
    "odd": arity(odd, 1, 1),
    "even": arity(even, 1, 1),
    "rotate": arity(rotate, 2, 1),
    maxby,
    minby,
    "to": arity(range_from_to, 2, 1),
    "divisors": arity(divisors, 1, 1),
    "at": arity(at, 2, 1),
    fold,
    scan,
    "int": arity(int, 1, 1),
    "uniq": arity(uniq, 1, 1),
    "get": arity(web_get, 1, 1),
    "sign": arity(sign, 1, 1),
    "not": arity(not, 1, 1),
    count,
    "index": arity(index, 2, 1),
    "chr": arity(chr, 1, 1),
    "ord": arity(ord, 1, 1),
    "chars": arity(chars, 1, 1),
    "elem": arity(elem, 2, 1),
}
const functions_compact = {
    "+": functions["+"],
    "-": functions["-"],
    "*": functions["*"],
    "/": functions["/"],
    "%": functions["%"],
    "^": functions["^"],
    "@": functions["apply"],
    "R": functions["repeat"],
    "m": functions["map"],
    "f": functions["filter"],
    "L": functions["length"],
    ":": functions["dup"],
    ";": functions["over"],
    "▲": functions["max"],
    "▼": functions["min"],
    "`": functions["dump"],
    "w": functions["wrap"],
    "W": functions["wrapN"],
    "W": functions["string"],
    "s": functions["string"],
    "$": functions["swap"],
    "↑": functions["take"],
    "↓": functions["drop"],
    "←": functions["head"],
    "→": functions["last"],
    "h": functions["init"],
    "t": functions["tail"],
    "x": functions["split"],
    "J": functions["join"],
    ",": functions["pair"],
    "=": functions["="],
    "<": functions["<"],
    ">": functions[">"],
    "z": functions["zipWith"],
    "T": functions["transpose"],
    "C": functions["slice"],
    "Σ": functions["sum"],
    "Π": functions["product"],
    "~": functions["pop"],
    "?": functions["ifelse"],
    "↔": functions["reverse"],
    "Z": functions["zip"],
    "H": functions["hex"],
    "H": functions["hex"],
    "↻": functions["rotate"],
    "►": functions["maxby"],
    "◄": functions["minby"],
    "…": functions["to"],
    "u": functions["uniq"],
    "¬": functions["not"],
    "#": functions["count"],
    "c": functions["chr"],
    "o": functions["ord"],
    "⊂": functions["elem"],
    "divisors": arity(divisors, 1, 1),
    fold,
    scan,
    "int": arity(int, 1, 1),
    "get": arity(web_get, 1, 1),
    "sign": arity(sign, 1, 1),
    "index": arity(index, 2, 1),
    "chars": arity(chars, 1, 1),
    "odd": arity(odd, 1, 1),
    "even": arity(even, 1, 1),
    iteraten,
    iteratewhile,
}

module.exports = {functions, functions_compact}