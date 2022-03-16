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