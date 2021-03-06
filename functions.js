const Stack = require("./stack.js")

const defs = require("./defs.js")

const { XMLHttpRequest } = require("xmlhttprequest")

const { Lazylist } = require("./infinitely_lazy/lazylist.js")
const { GInt, GFloat, GString, GList, GBlock, GListError} = require("./types.js")

// const toInt = a => ({"type": "int", "value": parseInt(a)})
const toInt = a => new GInt(a)
const toFloat = a => new GFloat(a)
const toString = a => new GString(a)
const toList = a => new GList(a)

const deepClone = a => {
    if(a.type == "int") return toInt(a.value)
    if(a.type == "float") return toFloat(a.value)
    if(a.type == "string") return toString(a.value)
    if(a.type == "list") return toList(a.map(deepClone))
    throw new Error("what type in deepclone what?!")
}
const todo = (...a) => {
    console.error(...a)
    throw new Error("todo")
}

const isInt = obj => obj.type == "int"
const isFloat = obj => obj.type == "float"
const isNumber = obj => obj.type == "int" || obj.type == "float"
const isString = obj => obj.type == "string"
const isList = obj => obj.type == "list"
const isBlock = obj => obj.type == "block"

const error = (name, ...params) => {
    console.error(`function ${name} doesn't take parameters ${params.map(e => e.type).join(", ")}`)
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

const isFalsy = (a) => {
    return !isFalsy(a)
}
const isTruthy = (a) => {
    
    if(isBlock(a)) return true // idk if block, now block.
    // if(isString(a)) return a.value === ""
    // if(isInt(a)) return a.value === 0
    // if(isFloat(a)) return a.value === 0.0
    // if(isList(a)) return a.value.length === 0
    let result = a?.toBool?.()
    if(result === true || result === false) return result
    console.error(a)
    throw new Error("what kind of value is this?!")
}

const vectorize = (func, a, b) => {
    if(isList(a) && isList(b)) return GList.zipWith(func, a, b)
    if(isList(a)) return a.map(e => func(e, b))
    if(isList(b)) return b.map(e => func(a, e))
    return func(a, b)
}

const plus = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value + b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.toNumber() + b.toNumber())
    if(isNumber(a) && isList(b)) return b.map(e => plus(e, a)) // vec
    if(isList(a) && isNumber(b)) return a.map(e => plus(e, b)) // vec
    if(isList(a) && isList(b)) return a.concat(b) // concat
    if(isString(a) && isString(b)) return toString(a.value + b.value) // concat
    throw new Error(`can't use ${"+"} on ${a.type} and ${b.type}`)
}
const minus = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value - b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.toNumber() - b.toNumber())
    if(isNumber(a) && isList(b)) return b.map(e => minus(e, a))
    if(isList(a) && isNumber(b)) return a.map(e => minus(e, b))
    // if(isList(a) && isList(b)) return a.map((e, i) => minus(e, b.at(i)))
    throw new Error(`can't use ${"-"} on ${a.type} and ${b.type}`)
}
const multiply = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value * b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.toNumber() * b.toNumber())
    if(isNumber(a) && isList(b)) return b.map(e => multiply(e, a))
    if(isList(a) && isNumber(b)) return a.map(e => multiply(e, b))
    if(isList(a) && isList(b)) return a.map((e, i) => multiply(e, b.at(i)))
    if(isString(a) && isNumber(b)) return toString(a.value.repeat(b.toNumber()) + a.value.slice(0, a.value.length * (b.toNumber() % 1)))
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
    if(isInt(a) && isInt(b)) return b.value == 0n ? toInt(0n) : toInt(a.value % b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.value % b.value)
    if(isNumber(a) && isList(b)) return b.map(e => mod(a, e))
    if(isList(a) && isNumber(b)) return a.map(e => mod(e, b))
    if(isList(a) && isList(b)) return GList.zipWith(mod, a, b)
    throw new Error(`can't use ${"%"} on ${a.type} and ${b.type}`)
}
const power = (a, b) => {
    if(isInt(a) && isInt(b)) return toInt(a.value ** b.value)
    if(isNumber(a) && isNumber(b)) return toFloat(a.toNumber() ** b.toNumber())
    if(isNumber(a) && isList(b)) return b.map(e => power(a, e))
    if(isList(a) && isNumber(b)) return a.map(e => power(e, b))
    if(isList(a) && isList(b)) return GList.zipWith(power, a, b)
    throw new Error(`can't use ${"^"} on ${a.type} and ${b.type}`)
}
const apply = (stack, self) => {
    let func = stack.pop()
    for(let command of func.value){
        self.doCommand(command)
    }
}

const repeat = (a, b) => {
    return GList.repeat(a).take(b.toNumber())
}


const arity = (func, input, output) => {
    return stack => {
        let args = input == 0 ? [] : stack.pop(input)
        let result = func(...args)
        if(result === undefined){
            error(func.name, ...args)
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
        let result = a.map(el => {
            stack.push(el)
            applyBlock(b, stack, self)
            return stack.pop()
        })
        stack.push(result)
        return
    }
    if(a.type == "string" && b.type == "block"){
        let result = []

        for(let element of a.value){
            // let stack = new Stack()
            stack.push(toString(element))
            for(let command of b.value){
                self.doCommand(command)
            }
            result.push(stack.pop())
        }
        stack.push(new GList(result))
        return
    }
    error("map", a, b)
}
const mapWith = (stack, self) => {
    let c = stack.pop()
    let b = stack.pop()
    let a = stack.pop()
    if(b.type == "list" && c.type == "block"){
        let result = b.map(el => {
            stack.push(a)
            stack.push(el)
            applyBlock(c, stack, self)
            return stack.pop()
        })
        stack.push(result)
        return
    }
    if(b.type == "string" && c.type == "block"){
        let result = []

        for(let element of b.value){
            // let stack = new Stack()
            stack.push(a)
            stack.push(toString(element))
            for(let command of c.value){
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
    error("mapWith", a, b, c)
}
const filter = (stack, self) => {
    let b = stack.pop()
    let a = stack.pop()
    if(isList(a) && isBlock(b)){
        let result = a.filter(el => {
            stack.push(el)
            applyBlock(b, stack, self)
            return isTruthy(stack.pop())
        })
        stack.push(result)
        return
    }
    error("filter", a, b)
}

const zipwith = (stack, self) => {
    let c = stack.pop()
    let b = stack.pop()
    let a = stack.pop()
    if(isList(a) && isList(b) && isBlock(c)){
        let result = GList.zipWith((x, y) => {
            stack.push(x)
            stack.push(y)
            applyBlock(c, stack, self)
            return stack.pop()
        }, a, b)
        stack.push(toList(result))
        return
    }
    error("zipwith", a, b, c)
}

const dump = (stack) => {
    let a = stack.pop()
    if(!isList(a)) return stack.push(a)
    stack.concat(a.to_array())
}
const length = (a) => {
    if(isString(a)) return toInt(a.value.length)
    if(isList(a)) return toInt(a.length)
    if(isNumber(a)) return toInt(a.value.toString().length)
}
const dup = (a) => [a, a]
const over = (a, b) => [a, b, a]
const max = (a) => {
    if(isList(a)) return a.reduce((x, y) => x.compareTo(y) == 1 ? x : y)
}
const min = (a) => {
    if(isList(a)) return a.reduce((x, y) => x.compareTo(y) == -1 ? x : y)
}
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
    stack.push(toList(stack.pop(num.toNumber())))
}
const string = (a) => {
    if(isList(a)) return toString(String.fromCharCode(...a.value.map(e => e.value)))
    if(isInt(a)) return toString(String.fromCharCode(a.value))
}
const show = (a) => {
    if(isInt(a)) return toString(a.toRawString())
    if(isFloat(a)) return toString(a.toRawString())
    if(isString(a)) return toString(a.toRawString())
    if(isList(a)) return toString(a.toRawString())
    if(isBlock(a)) return toString(a.toRawString())
}
const swap = (a, b) => [b, a]
const take = (a, b) => {
    if(isList(a) && isInt(b)) return a.take(b.toNumber())
    if(isString(a) && isInt(b)) return toString(a.value.slice(0, b.value))
}
const drop = (a, b) => {
    if(isList(a) && isInt(b)) return toList(a.drop(b.toNumber()))
    if(isString(a) && isInt(b)) return toString(a.value.slice(b.value))
}
const head = (a) => {
    if(isString(a)) return toString(a.value[0])
    if(isList(a)) return a.head()
    if(isInt(a)) return minus(a, toInt(1))
}
const tail = (a) => {
    if(isString(a)) return toString(a.tail())
    if(isList(a)) return toList(a.tail())
}
const init = (a) => {
    if(isString(a)) return toString(a.value.slice(0, -1))
    if(isList(a)) return toList(a.init())
}
const last = (a) => {
    if(isString(a)) return toString(a.value[a.value.length - 1])
    if(isList(a)) return a.last()
    if(isInt(a)) return plus(a, toInt(1))
}
const split = (a, b) => {
    if(isString(a) && isString(b)) return toList(a.value.split(b.value).map(toString))
}
const join = (a, b) => {
    if(isString(b)){
        if(isString(a)) return a
        // if(isList(a)) return toString(a.value.map(x => join(x, b).value).join(b.value))
        if(isList(a)) return toString(a.map(x => join(x, b).value).to_array().join(b.value))
        return toString(stringify(a))
    }
}
const pair = (a, b) => {
    return toList([a, b])
}
const equals = (a, b) => { // vectorizes

    let true_val = toInt(1)
    let false_val = toInt(0)

    if(isNumber(a) && isNumber(b)) return a.value == b.value ? true_val : false_val
    if(isString(a) && isString(b)) return a.value === b.value ? true_val : false_val
    if(isBlock(a) && isBlock(b)) return a.toString() == b.toString() ? true_val : false_val
    return vectorize(equals, a, b)
    // console.error(a)
    // console.error(b)
    throw new Error(" whtat type ?!?!?!")
}
const matches = (a, b) => {

    let true_val = toInt(1)
    let false_val = toInt(0)

    if(isNumber(a) && isNumber(b)) return a.value == b.value ? true_val : false_val
    if(a.type != b.type) return false_val
    // from now, types are same

    if(isString(a)) return a.value === b.value ? true_val : false_val


    if(isList(a)) return a.equals(b) ? true_val : false_val
    // if(isList(a)){
    //     if(a.value.length != b.value.length) return false_val
    //     for(let i = 0; i < a.value.length; i++){
    //         if(equals(a.value[i], b.value[i]).value == 0) return false_val
    //     }
    //     return true_val
    // }
    console.error(a)
    console.error(b)
    throw new Error(" whtat type ?!?!?!")
}
const not_equals = (a, b) => {
    return toInt(equals(a, b).value == 1 ? 0 : 1)
}
const less_than = (a, b) => {
    let true_val = toInt(1)
    let false_val = toInt(0)
    if(isNumber(a) && isNumber(b)) return a.value < b.value ? true_val : false_val
}
const less_than_or_equal = (a, b) => {
    let true_val = toInt(1)
    let false_val = toInt(0)
    if(isNumber(a) && isNumber(b)) return a.value <= b.value ? true_val : false_val
}
const greater_than = (a, b) => {
    let true_val = toInt(1)
    let false_val = toInt(0)
    if(isNumber(a) && isNumber(b)) return a.value > b.value ? true_val : false_val
}
const greater_than_or_equal = (a, b) => {
    let true_val = toInt(1)
    let false_val = toInt(0)
    if(isNumber(a) && isNumber(b)) return a.value >= b.value ? true_val : false_val
}
const transpose = (a) => {
    if(isList(a) && isList(a.at(0))) return a.transpose()
}
const slice = (a, b) => {
    if(!isNumber(b)) return
    if(isList(a)){
        return a.slicesOfLength(b.toNumber())
        // let result = []
        // for(let i = 0; i < a.value.length; i += b.value){
        //     result.push(a.value.slice(i, i + b.value))
        // }
        // return toList(result.map(toList))
    }
    if(isString(a)){
        let result = []
        for(let i = 0; i < a.value.length; i += b.value){
            result.push(a.value.slice(i, i + b.value))
        }
        return toList(result.map(toString))
    }
}
const cons_slice = (a, b) => {
    if(!isNumber(b)) return
    if(isList(a)){
        return a.consSlicesOfLength(b.toNumber())
    }
    if(isString(a)){ // untested, as most things lol
        let result = []
        for(let i = 0; i < a.value.length - a.toNumber(); i ++){
            result.push(a.value.slice(i, i + b.toNumber()))
        }
        return toList(result.map(toString))
    }
}

const sum = (a) => {
    if(isList(a)){
        return a.reduce((x, y) => plus(x, y))
    }
}
const cumsum = (a) => {
    if(isList(a)){
        return a.scan(plus)
    }
}
const product = (a) => {
    if(isList(a)){
        return a.reduce(multiply)
    }
}
const iteraten = (stack, self) => {
    // any, func, iterations
    let c = stack.pop()
    let b = stack.pop()
    let a = stack.pop()
    if(isBlock(b) && isInt(c)){
        let func = val => {
            stack.push(val)
            applyBlock(b, stack, self)
            return stack.pop()
        }
        let result = GList.iterate(func, a).take(c.toNumber())
        stack.push(result)
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
    if(isList(a)) return toList(a.reverse())
    if(isString(a)) return toString(a.value.split("").reverse().join(""))
}
const zip = (a, b) => {
    if(isList(a) && isList(b)){
        // let min_length = Math.min(a.value.length, b.value.length)
        // return toList(a.value.slice(0, min_length).map((e, i) => toList([e, b.value[i]])))
        return toList(GList.zipWith(pair, a, b))
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
        let length = a.length
        let steps = ((b.toNumber() % length) + length) % length // posistive mod length
        // return toList(a.value.slice(steps).concat(a.value.slice(0, steps)))
        return a.drop(steps).concat(a.take(steps))
    }
    if(isString(a)){
        let length = a.value.length
        let steps = ((b.value % length) + length) % length // posistive mod length
        return toString(a.value.slice(steps).concat(a.value.slice(0, steps)))
    }
}
const maxby = (stack, self) => {
    let b = stack.pop() // func
    let a = stack.pop() // arr

    if(isList(a) && isBlock(b)){
        let last_result = null
        let result = a.reduce((x, y) => {
            let x_result
            if(last_result){
                x_result = last_result
            }else{
                stack.push(x)
                applyBlock(b, stack, self)
                x_result = stack.pop()
            }
            stack.push(y)
            applyBlock(b, stack, self)
            let y_result = stack.pop()
            let max = x_result.compareTo(y_result) == 1 ? x : y
            last_result = y_result
            return max
        })
        stack.push(result)
        return
    }

    error("maxby", a, b)
}
const minby = (stack, self) => {
    let b = stack.pop() // func
    let a = stack.pop() // arr

    if(isList(a) && isBlock(b)){
        let last_result = null
        let result = a.reduce((x, y) => {
            let x_result
            if(last_result){
                x_result = last_result
            }else{
                stack.push(x)
                applyBlock(b, stack, self)
                x_result = stack.pop()
            }
            stack.push(y)
            applyBlock(b, stack, self)
            let y_result = stack.pop()
            let max = x_result.compareTo(y_result) == -1 ? x : y
            last_result = y_result
            return max
        })
        stack.push(result)
        return
    }

    error("minby", a, b)
}
const range_from_to = (a, b) => {
    if(isInt(a) && isInt(b)){
        let length = Math.abs(a.toNumber() - b.toNumber()) + 1
        if(a.value < b.value) return new GList((self, index) => toInt(BigInt(index) + a.value), () => length)
        return new GList((self, index) => toInt(a.value - BigInt(index)), () => length)
        // let result = []
        // let diff = a.value < b.value ? 1n : -1n
        // for(let i = a.value; i != b.value; i += diff){
        //     result.push(toInt(i))
        // }
        // result.push(toInt(b.value))
        // return toList(result)
    }
}
const divisors = (a) => {
    if(isInt(a)){
        return toList(defs.range(a.value).filter(e => a.value % e == 0).map(toInt))
    }
}
const at = (a, b) => { // modular indexing
    if(isList(a) && isInt(b)){
        // let length = a.value.length
        // return a.value[(b.value % length + length) % length]
        try {
            return a.at(b.toNumber())
        }catch(e){
            if(!(e instanceof GListError)) throw e
            return a.at((b.toNumber() % a.length + a.length) % a.length)
        }
    }
}
const fold = (stack, self) => {
    let b = stack.pop() // block
    let a = stack.pop() // arr

    if(isList(a) && isBlock(b)){
        if(a.length == 0){ // if empty, push 0
            stack.push(toInt(0))
            return
        }

        let result = a.reduce((x, y) => {
            stack.push(x)
            stack.push(y)
            applyBlock(b, stack, self)
            return stack.pop()
        })
        stack.push(result)
        return
    }

    error("fold", a, b)
}
const scan = (stack, self) => {
    let b = stack.pop() // block
    let a = stack.pop() // arr

    if(isList(a) && isBlock(b)){
        if(a.length == 0){ // if empty, push 0
            stack.push(toInt(0))
            return
        }

        let result = a.scan((x, y) => {
            stack.push(x)
            stack.push(y)
            applyBlock(b, stack, self)
            return stack.pop()
        })
        stack.push(result)
        return
    }

    error("scan", a, b)
}
// const scan = (stack, self) => {
//     let b = stack.pop() // block
//     let a = stack.pop() // arr

//     if(isList(a) && isBlock(b)){
//         if(a.value.length == 0){ // if empty, push []
//             stack.push(toList([]))
//             return
//         }
//         let val = a.value[0]
//         let result = [val]
//         for(let i = 1; i < a.value.length; i++){
//             stack.push(val)
//             stack.push(a.value[i])
//             applyBlock(b, stack, self)
//             val = stack.pop()
//             result.push(val)
//         }
//         stack.push(toList(result))
//         return
//     }

//     error("scan", a, b)
// }
const int = (a) => {
    if(isList(a)) return
    return toInt(a.value)
}
const uniq = (a) => {
    if(isList(a)){
        const func = (self) => {
            let result = []
            self.to_array().forEach(el => {
                if(result.every(e => !e.equals(el))) result.push(el)
            })
            return GList.from(result)
        }
        return a.call(func)
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
                // console.log(a.value[i])
                // console.log(b)
                if(isTruthy(equals(isString(a) ? toString(a.value[i]) : a.value[i], b))) count_num++
            }
        }
        stack.push(toInt(count_num))
        return
    }

    error("count", a, b)
}
const index = (a, b) => {
    if(isList(a)){
        let i = 0
        for(let value of a){
            if(value.equals(b)) return toInt(i)
            i++
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
    if(isNumber(a)) return toString(String.fromCharCode(Math.floor(a.toNumber())))
    if(isList(a)) return toList(a.value.map(chr))
}
const ord = (a) => {
    if(isString(a)){
        if([...a.toString()].length == 1){ // return single int
            return toInt(a.value.charCodeAt())
        }
        return toList(a.map(x => toInt(x.charCodeAt()))) // return codepoint list
    }
    if(isList(a)) return toList(a.map(ord))
}
const chars = (a) => {
    if(isString(a)) return toList([...a.value].map(toString))
}
const elem = (a, b) => {
    if(isList(a)){

        let result = a.map(e => equals(e, b).value == 1).reduce((x, y) => x || y, false)
        return toInt(result ? 1 : 0)
        // for(let i = 0; i < a.value.length; i++){
            // if(equals(a.value[i], b).value == 1) return toInt(1)
        // }
        // return toInt(0)
    }
    if(isString(a)){
        if([...a.value].length == 1) return toInt(a.value.includes(b.value) ? 1 : 0)
        return toInt(a.value.includes(b.value) ? 1 : 0)
        // vvv ?
        for(let i = 0; i < a.value.length; i++){
            if(equals(toString(a.value[i]), b).value == 1) return toInt(1)
        }
        return toInt(0)
    }
    return
}
const lines = (a) => {
    if(isString(a)){
        return toList(a.value.split("\n").map(toString))
    }
    if(isNumber(a)) return toString(a.value)
    if(isList(a)) return toString(a.map(stringify).to_array().join("\n"))
}
const words = (a) => {
    if(isString(a)){
        return toList(a.value.split(" ").map(toString))
    }
    if(isNumber(a)) return toString(a.value)
    if(isList(a)) return toString(a.map(stringify).to_array().join(" "))
}
const sort = (a) => {

    if(isString(a)) return toString([...a.value].sort().join(""))
    if(isList(a)) return a.sort()
    // if(a.value.every(isString)) return toList(a.value.map(({value}) => value).sort().map(toString))
    // if(a.value.every(isInt)) return toList(a.value.map(({value}) => value).sort((x, y) => x - y).map(toInt))
    // if(a.value.every(isFloat)) return toList(a.value.map(({value}) => value).sort((x, y) => x - y).map(isFloat))
}
const dice = () => {
    return toInt(1 + Math.floor(Math.random() * 6))
}
const bitcoin = () => {
    let request = new XMLHttpRequest()
    request.open("GET", "https://api.coinbase.com/v2/prices/spot?currency=USD", false)
    request.send()
    if(request.status != 200){
        console.error(request.status)
    }
    let text = request.responseText ?? "{}"
    let json = JSON.parse(text)

    return toFloat(json?.data?.amount ?? 0)
}
const inits = (a) => {
    if(isInt(a)){
        if(a.value < 0n) return new GList((self, index) => toInt(a.value + BigInt(index)), () => -a.toNumber(), -a.toNumber())
        return new GList((self, index) => toInt(index + 1), () => a.toNumber(), a.toNumber())
    }
    if(isList(a)) return a.inits()
    if(isString(a)) return todo()
}
const tails = (a) => {
    if(isInt(a)){
        if(a.value < 0n) return new GList((self, index) => toInt(a.value + BigInt(index + 1)), () => -a.toNumber(), -a.toNumber())
        return new GList((self, index) => toInt(index), () => a.toNumber(), a.toNumber())
    }
    if(isList(a)) return a.tails()
    if(isString(a)) return todo()
}
const lower = (a) => {
    if(isInt(a)) return toInt(-a.value)
    if(isFloat(a)) return toFloat(-a.value)
    if(isString(a)) return toString(a.value.toLowerCase())
    if(isList(a)) return a.map(lower)
}
const append = (a, b) => {
    // todo string append
    if(!isList(a)) return
    return a.append(b)
}
const prepend = (a, b) => {
    // todo string prepend
    if(!isList(a)) return
    return a.prepend(b)
}
const shuffle = (a) => {
    if(isList(a)){
        let arr = a.to_array()
        let result = []
        while(arr.length > 0){
            let index = Math.floor(Math.random() * arr.length)
            result.push(arr[index])
            arr.splice(index, 1)
        }
        return GList.from(result)
    }
}
const empty = () => {
    return GList.empty
}
const iterate = (stack, self) => {
    
    let b = stack.pop() // block
    let a = stack.pop() // any

    if(isBlock(b)){
        const func = (v) => {
            stack.push(v)
            applyBlock(b, stack, self)
            return stack.pop()
        }
        
        stack.push(GList.iterate(func, a))
        return
    }

    error("iterate", a, b)
}
const and = (a, b) => {
    return toInt(isTruthy(a) && isTruthy(b) ? 1 : 0)
}
const or = (a, b) => {
    return toInt(isTruthy(a) || isTruthy(b) ? 1 : 0)
}
const digits = (a) => {
    if(isInt(a)){
        let n = a.value + 0n
        let dig = []
        while(n > 0n){
            dig.push(toInt(n % 10n))
            n /= 10n
        }
        return GList.from(dig.reverse())
    }
    if(isList(a)){
        let n = toInt(0)
        a.to_array().forEach(el => {
            n = plus(multiply(n, toInt(10)), el)
        })
        return n
    }
}
const abs = (a) => {
    if(isInt(a)) return toInt(a.value < 0 ? -a.value : a.value)
    if(isFloat(a)) return toFloat(a.value < 0 ? -a.value : a.value)
}
const uniq_prefix = (a) => {
    const func = (self) => {
        let seen = []
        let i = 0;
        while(true){
            let el = self.at(i)
            let has_seen = seen.some(e => e.equals(el))
            if(has_seen){
                return GList.from(seen)
            }
            seen.push(el)
            i++
        }
    }
    return a.call(func)
}
const is_prime = (a) => {
    if(!isInt(a)) return
    if(a.value < 2n) return toInt(0)
    for(let i = 2n; i + 1n < a.value; i++){
        if(a.value % i == 0) return toInt(0)
    }
    return toInt(1)
}
const do_func = (stack, self) => {
    let name = stack.pop()
    if(!isString(name)) return
    let func = functions[name.toString()]
    if(func) func(stack)
}
const javascript = (stack, self) => {
    let code = stack.pop()
    if(!isString(code)) return
    eval(code.toString())
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
    mapWith,
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
    "equals": arity(equals, 2, 1),
    "matches": arity(matches, 2, 1),
    "not_equals": arity(not_equals, 2, 1),
    "<": arity(less_than, 2, 1),
    ">": arity(greater_than, 2, 1),
    "???": arity(less_than_or_equal, 2, 1),
    "???": arity(greater_than_or_equal, 2, 1),
    zipwith,
    "transpose": arity(transpose, 1, 1),
    "slice": arity(slice, 2, 1),
    "sum": arity(sum, 1, 1),
    "cumsum": arity(cumsum, 1, 1),
    "product": arity(product, 1, 1),
    iterate,
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
    "uniqprefix": arity(uniq_prefix, 1, 1),
    "get": arity(web_get, 1, 1),
    "sign": arity(sign, 1, 1),
    "not": arity(not, 1, 1),
    count,
    "index": arity(index, 2, 1),
    "chr": arity(chr, 1, 1),
    "ord": arity(ord, 1, 1),
    "chars": arity(chars, 1, 1),
    "elem": arity(elem, 2, 1),
    "lines": arity(lines, 1, 1),
    "words": arity(words, 1, 1),
    "sort": arity(sort, 1, 1),
    "dice": arity(dice, 0, 1),
    "bitcoin": arity(bitcoin, 0, 1),
    "inits": arity(inits, 1, 1),
    "tails": arity(tails, 1, 1),
    "lower": arity(lower, 1, 1),
    "append": arity(append, 2, 1),
    "prepend": arity(prepend, 2, 1),
    "shuffle": arity(shuffle, 1, 1),
    "empty": arity(empty, 0, 1),
    "show": arity(show, 1, 1),
    "and": arity(and, 2, 1),
    "or": arity(or, 2, 1),
    "digits": arity(digits, 1, 1),
    "cons": arity(cons_slice, 2, 1),
    "abs": arity(abs, 1, 1),
    "prime": arity(is_prime, 1, 1),
    "do_func": do_func,
    javascript
}
const functions_compact = {
    "+": functions["+"],
    "-": functions["-"],
    "*": functions["*"],
    "/": functions["/"],
    "%": functions["%"],
    "^": functions["^"],
    "_": functions["lower"],
    "??": functions["apply"],
    "@": functions["at"],
    "R": functions["repeat"],
    "m": functions["map"],
    "M": functions["mapWith"],
    "f": functions["filter"],
    "L": functions["length"],
    "D": functions["dup"],
    ";": functions["over"],
    "???": functions["max"],
    "???": functions["min"],
    "`": functions["dump"],
    "W": functions["wrap"],
    "???": functions["wrapN"],
    "s": functions["show"],
    "$": functions["swap"],
    "???": functions["take"],
    "???": functions["drop"],
    "???": functions["head"],
    "???": functions["last"],
    "h": functions["init"],
    "t": functions["tail"],
    "x": functions["split"],
    "J": functions["join"],
    ",": functions["pair"],
    "=": functions["equals"],
    "???": functions["not_equals"],
    "<": functions["<"],
    ">": functions[">"],
    "???": functions["???"],
    "???": functions["???"],
    "z": functions["zipwith"],
    "T": functions["transpose"],
    "C": functions["slice"],
    "X": functions["cons"],
    "??": functions["sum"],
    "???": functions["cumsum"],
    "??": functions["product"],
    "~": functions["pop"],
    "?": functions["ifelse"],
    "???": functions["reverse"],
    "Z": functions["zip"],
    "H": functions["hex"],
    "H": functions["hex"],
    "???": functions["rotate"],
    "???": functions["maxby"],
    "???": functions["minby"],
    "???": functions["to"],
    "u": functions["uniq"],
    "U": functions["uniqprefix"],
    "??": functions["not"],
    "#": functions["count"],
    "c": functions["chr"],
    "o": functions["ord"],
    "???": functions["elem"],
    "??": functions["lines"],
    "w": functions["words"],
    "??": functions["iteratewhile"],
    "???": functions["iteraten"],
    "!": functions["iterate"],
    "S": functions["sort"],
    "????": functions["dice"],
    "???": functions["bitcoin"],
    "n": functions["int"],
    "???": functions["inits"],
    "???": functions["tails"],
    ":": functions["prepend"],
    ".": functions["append"],
    "r": functions["shuffle"],
    "????": functions["get"],
    "F": functions["fold"],
    "G": functions["scan"],
    "??": functions["empty"],
    "??": functions["sign"],
    "i": functions["index"],
    "&": functions["and"],
    "|": functions["or"],
    "d": functions["digits"],
    "a": functions["abs"],
    "???": functions["matches"],
    "p": functions["prime"],
    "??": functions["do_func"],
    "chars": arity(chars, 1, 1),
    "divisors": arity(divisors, 1, 1),
    "odd": arity(odd, 1, 1),
    "even": arity(even, 1, 1),
}

module.exports = {functions, functions_compact}
