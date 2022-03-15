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

const applyTo = (func, ret_type) => (a, b) => ({"type": ret_type, "value": func(a.value, b.value)})



const plus = (a, b) => {
    if(isInt(a) && isInt(b)) return applyTo((x,y)=>x+y, "int")(a,b)
    if(isNumber(a) && isNumber(b)) return applyTo((x,y)=>x+y, "float")
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.value.map(e => plus(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.value.map(e => plus(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.value.map((e, i) => plus(e, b[i]))}
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
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value / b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value / b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.value.map(e => divide(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.value.map(e => divide(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.value.map((e, i) => divide(e, b[i]))}
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
const split = (a, b) => {
    if(isString(a) && isStringy(b)){
        return toList(defs.split_string(a.value, b.value).map(toString))
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


module.exports = {
    "+": arity(plus, 2, 1),
    "-": arity(minus, 2, 1),
    "*": arity(multiply, 2, 1),
    "/": arity(divide, 2, 1),
    "@": apply,
    "r": arity(repeat, 2, 1),
    "range": arity(range, 1, 1),
    "split": arity(split, 2, 1),
    "map": map
}