const isNumber = token => token.type == "int" || token.type == "float"
const isInt = token => token.type == "int"
const isString = token => token.type == "string"
const isChar = token => token.type == "char"
const isStringy = token => token.type == "string" || token.type == "char"
const isList = token => token.type == "list"
const isListy = token => token.type == "list" || token.type == "string"



const plus = (a, b) => {
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value + b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value + b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.map(e => plus(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.map(e => plus(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.map((e, i) => plus(e, b[i]))}
    throw new Error(`can't use ${"+"} on ${a.type} and ${b.type}`)
}
const minus = (a, b) => {
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value - b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value - b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.map(e => minus(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.map(e => minus(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.map((e, i) => minus(e, b[i]))}
    throw new Error(`can't use ${"-"} on ${a.type} and ${b.type}`)
}
const multiply = (a, b) => {
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value * b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value * b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.map(e => multiply(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.map(e => multiply(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.map((e, i) => multiply(e, b[i]))}
    throw new Error(`can't use ${"*"} on ${a.type} and ${b.type}`)
}
const divide = (a, b) => {
    if(isInt(a) && isInt(b)) return {"type": "int", "value": a.value / b.value}
    if(isNumber(a) && isNumber(b)) return {"type": "float", "value": a.value / b.value}
    if(isNumber(a) && isList(b)) return {"type": "list", "value": b.map(e => divide(e, a))}
    if(isList(a) && isNumber(b)) return {"type": "list", "value": a.map(e => divide(e, b))}
    if(isList(a) && isList(b)) return {"type": "list", "value": a.map((e, i) => divide(e, b[i]))}
    throw new Error(`can't use ${"/"} on ${a.type} and ${b.type}`)
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
        "value": Array(a).fill(b)
    }
}


const arity = (func, input, output) => {
    return stack => {
        let args = stack.pop(input)
        let result = func(...args)
        if(output == 1){
            stack.push(result)
        }
        else{
            stack.concat(result)
        }
    }
}

module.exports = {
    "+": arity(plus, 2, 1),
    "-": arity(minus, 2, 1),
    "*": arity(multiply, 2, 1),
    "/": arity(divide, 2, 1),
    "@": apply,
    "r": arity(repeat, 2, 1)
}