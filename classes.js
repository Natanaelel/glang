const { Lazylist } = require("./infinitely_lazy/lazylist.js")


class GInt {
    constructor(n = 0n){
        this.value = BigInt(n)
        this.type = "int"
    }
    toString(){
        return this.value.toString()
    }
    toRawString(){
        return this.toString()
    }
    valueOf(){
        return this.value
    }
    toNumber(){
        return Number(this.value)
    }
    isInt(){ return true}
    isFloat(){ return false}
    isString(){ return false}
    isList(){ return false}
}
class GFloat {
    constructor(f = 0.0){
        this.value = Number(f)
        this.type = "float"
    }
    toString(){
        return this.value.toString()
    }
    toRawString(){
        return this.toString()
    }
    valueOf(){
        return this.value
    }
    toNumber(){
        return this.value
    }
    isInt(){ return false}
    isFloat(){ return true}
    isString(){ return false}
    isList(){ return false}
}
class GString {
    constructor(str = ""){
        this.value = `${str}`
        this.type = "string"
    }
    toString(){
        return this.value
    }
    toRawString(){
        return `"${this.value.toString().replace(/.|\s/g, m => {
            if(m == "\n") return "\\n"
            if(m == "\r") return "\\r"
            if(m == "\f") return "\\f"
            if(m == '"') return '\\"'
            if(m == "\\") return "\\\\"
            return m
        })}"`
    }
    valueOf(){
        return this.value
    }
    isInt(){ return false}
    isFloat(){ return false}
    isString(){ return true}
    isList(){ return false}
}
class GList {
    constructor(arr = []){
        if(!(arr instanceof GList) && !Array.isArray(arr) && !(arr instanceof Lazylist)) throw new TypeError("arr is not an array or LazyList")
        
        this.value = Array.isArray(arr) ? Lazylist.from(arr) : arr
        this.type = "list"
    }
    toString(max_elements = Infinity){
        return "[" + this.value.take(max_elements).to_array().map(x => x.toString()).join(", ") + "]"
    }
    toRawString(max_elements = Infinity){
        return "[" + this.value.take(max_elements).to_array().map(x => x.toRawString?.() ?? x.toString()).join(", ") + "]"
    }
    valueOf(){
        return this.value
    }
    isInt(){return true}
    isFloat(){return false }
    isString(){return false }

    at(index){return this.value.at(index)}
    map(mapping_func){return new GList(this.value.map(mapping_func))}
    filter(predicate){return new GList(this.value.filter(predicate))}
    head(){return this.value.head()}
    tail(){return new GList(this.value.tail())}
    init(){return new GList(this.value.init())}
    last(){return this.value.last()}
    take(num){return new GList(this.value.take(num))}
    take_while(predicate){return new GList(this.value.take_while(predicate))}
    drop(num){return new GList(this.value.drop(num))}
    call(func){return this.value.call(func)}
    concat(other){ return new GList(this.value.concat(other))}
    to_array(max_elements){ return this.value.to_array(max_elements)}
    to_array_deep(){ return this.value.to_array_deep()}
    reverse(){ return new GList(this.value.reverse())}



    transpose(){
        let self = this
        const get_at = (self1, index1) => {
            const get_at2 = (self2, index2) => {
                return this.at(index2).at(index1)
            }
            return new GList(new Lazylist(get_at2, () => self.value.get_size(), self.value.get_size()))
        }
        return new GList(new Lazylist(get_at, () => this.at(0).value.get_size(), this.at(0).value.get_size()))
    }
}

class GBlock {
    constructor(b){
        this.value = b
    }
}

module.exports = {
    GInt,
    GFloat,
    GString,
    GList,
    GBlock
}