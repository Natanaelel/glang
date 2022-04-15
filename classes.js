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
// class GList {
//     constructor(arr = []){
//         if(!(arr instanceof GList) && !Array.isArray(arr) && !(arr instanceof Lazylist)) throw new TypeError("arr is not an array or LazyList")
        
//         this.value = Array.isArray(arr) ? Lazylist.from(arr) : arr
//         this.type = "list"
//     }
//     toString(max_elements = Infinity){
//         return "[" + this.value.take(max_elements).to_array().map(x => x.toString()).join(", ") + "]"
//     }
//     toRawString(max_elements = Infinity){
//         return "[" + this.value.take(max_elements).to_array().map(x => x.toRawString?.() ?? x.toString()).join(", ") + "]"
//     }
//     valueOf(){
//         return this.value
//     }
//     isInt(){return true}
//     isFloat(){return false }
//     isString(){return false }

//     at(index){return this.value.at(index)}
//     map(mapping_func){return new GList(this.value.map(mapping_func))}
//     filter(predicate){return new GList(this.value.filter(predicate))}
//     head(){return this.value.head()}
//     tail(){return new GList(this.value.tail())}
//     init(){return new GList(this.value.init())}
//     last(){return this.value.last()}
//     take(num){return new GList(this.value.take(num))}
//     take_while(predicate){return new GList(this.value.take_while(predicate))}
//     drop(num){return new GList(this.value.drop(num))}
//     call(func){return this.value.call(func)}
//     concat(other){ return new GList(this.value.concat(other))}
//     to_array(max_elements){ return this.value.to_array(max_elements)}
//     to_array_deep(){ return this.value.to_array_deep()}
//     reverse(){ return new GList(this.value.reverse())}



//     transpose(){
//         let self = this
//         const get_at = (self1, index1) => {
//             const get_at2 = (self2, index2) => {
//                 return this.at(index2).at(index1)
//             }
//             return new GList(new Lazylist(get_at2, () => self.value.get_size(), self.value.get_size()))
//         }
//         return new GList(new Lazylist(get_at, () => this.at(0).value.get_size(), this.at(0).value.get_size()))
//     }
// }
class GListError extends Error {}

class GList {
    constructor(func, get_size, size = Infinity){
        if(func instanceof GList){
            return func
        }
        if(Array.isArray(func)){
            return GList.from(func)
        }
        // console.log(func)
        this.func = func // func = (this, index) => element
        this.get_size = get_size || (() => this.to_array().length)
        this.list = []
        this.size = size
        this.type = "list"
    }
    toString(max_elements = Infinity){
        return "[" + this.take(max_elements).to_array().map(x => x.toString()).join(", ") + "]"
    }
    toRawString(max_elements = Infinity){
        return "[" + this.take(max_elements).to_array().map(x => x.toRawString?.() ?? x.toString()).join(", ") + "]"
    }
    isInt(){return false}
    isFloat(){return false }
    isString(){return false }
    isList(){ return true}

    
    at(index){
        if(index >= this.get_size()) throw new GListError("index too large")
        if(index < 0) throw new GListError("index too small")
        
        if(index in this.list){
            return this.list[index]
        }
        else{
            this.list[index] = this.func(this, index)
            return(this.list[index])
        }
    }
    map(mapping_func){
        const get_at = (self, index) => mapping_func(this.at(index))
        return new GList(get_at, () => this.get_size())
    }
    filter(predicate){
        let filtered = []
        let last_index = 0
        const get_at = (self, index) => {
            for(let _i = filtered.length; _i <= index; _i++){
                while(!predicate(this.at(last_index))){
                    last_index += 1
                }
                filtered.push(this.at(last_index))
                last_index += 1
                }
            return filtered[index]
        }
        return new GList(get_at, () => this.get_size())
    }
    head(){
        return this.at(0)
    }
    tail(){
        const get_at = (self, index) => this.at(index + 1)
        return new GList(get_at, () => this.get_size() - 1)
    }
    init(){
        const get_at = (self, index) => this.at(index)
        return new GList(get_at, () => this.get_size() - 1)
    }
    last(){
        return this.at(this.get_size() - 1)
    }
    take(num){
        const get_at = (self, index) => this.at(index)
        return new GList(get_at, () => Math.min(num, this.get_size()))
    }
    take_while(predicate){ // recurively defined
        const get_at = (self, index) => {    
            if(predicate(this.at(index))){
                if(index == 0) return this.at(index) // base case here
                if(predicate(this.at(index - 1))) return this.at(index) // recursion here
                throw new GListError("index too large")
            }
            throw new GListError("index too large")
        }
        return new GList(get_at, () => this.get_size())
    }
    drop(num){
        const get_at = (self, index) => this.at(index + num)
        return new GList(get_at, () => this.get_size() - num)
    }
    call(func){
        let result = null
        const get_at = (self, index) => {
            if(result !== null){
                return result.at(index)
            }
            result = func(this)
            return result.at(index)
        }
        return new GList(get_at, () => this.get_size())
    }
    concat(other){
        const get_at = (self, index) => {
            try{
                return this.at(index)
            }
            catch(e){
                if(!(e instanceof GListError)) throw e
                return other.at(index - this.get_size())
            }
        }
        return new GList(get_at, () => this.get_size() + other.get_size())
    }
    to_array(max_elements = Infinity){ // todo: respect max_elements
        let arr = []
        this.size = this.get_size()
        for(let i = 0; i < this.size; i++){
            try{
                arr.push(this.at(i))
            }catch(e){
                if(!(e instanceof GListError)) throw e
                this.size = i
                this.get_size = () => this.size
                return arr
            }
        }
        return arr
        // return Array(this.get_size()).fill().map((_, i) => this.at(i))
    }
    to_array_deep(){
        return this.to_array().map(x => {
            if(x instanceof GList) return x.to_array_deep()
            return x
        })
    }
    reduce(...args){
        return this.to_array().reduce(...args)
    }
    transpose(){
        let self = this
        const get_at = (self1, index1) => {
            const get_at2 = (self2, index2) => {
                return this.at(index2).at(index1)
            
            }
            return new GList(get_at2, () => self.get_size(), self.get_size())
        }
        return new GList(get_at, () => this.at(0).get_size(), this.at(0).get_size())
    }
    reverse(){
        const get_at = (self, index) => {
            return this.at(self.get_size() - index - 1)
        }
        return new GList(get_at, () => this.get_size(), this.size)
    }
    static zipWith(func, a, b){
        const get_at = (self, index) => {
            return func(a.at(index), b.at(index))
        }
        return new GList(get_at, () => Math.min(a.get_size() + b.get_size()), Math.min(a.get_size() + b.get_size()))
    }
    static repeat(element){
        return new GList(() => element, () => Infinity)
    }
    static cycle(list){
        const get_at = (self, index) => {
            return list.at(index % list.length)
        }
        return new GList(get_at, () => Infinity)
    }
    static from(arr){
        const get_at = (self, index) => {
            return arr[index]
        }
        return new GList(get_at, () => arr.length, arr.length)
    }
    static iterate(func, start_val){
        const get_at = (self, index) => {
            if(index == 0) return start_val
            return func(self.at(index - 1))
        }
        return new GList(get_at, () => Infinity)
    }
    static naturals = new GList((_, i) => i + 1, () => Infinity)
    static reals = new GList((_, i) => 0 + (((i & 1) << 1) -1) * ((i + 1) >> 1), () => Infinity)
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

