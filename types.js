class GInt {
    constructor(n = 0n){
        if(n === Infinity) return new GFloat(n)
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
    toBool(){
        return this.value !== 0n
    }
    equals(other){
        return (other instanceof GInt) && other.value == this.value
    }
    compareTo(other){
        if(other instanceof GInt) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        if(other instanceof GFloat) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        throw new TypeError(`can't compare ${this.type} with ${other.type ?? other}`)
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
    toBool(){
        return this.value !== 0
    }
    equals(other){
        return (other instanceof GFloat) && other.value == this.value
    }
    compareTo(other){
        if(other instanceof GFloat) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        if(other instanceof GInt) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        throw new TypeError(`can't compare ${this.type} with ${other.type ?? other}`)
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
    get length(){
        return this.value.length
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
    toBool(){
        return this.value !== ""
    }
    equals(other){
        return (other instanceof GString) && other.value == this.value
    }
    compareTo(other){
        if(other instanceof GString) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        throw new TypeError(`can't compare ${this.type} with ${other.type ?? other}`)
    }
    isInt(){ return false}
    isFloat(){ return false}
    isString(){ return true}
    isList(){ return false}
}

class GListError extends Error {}

class GList {
    constructor(func, get_size = Infinity, size = null){
        if(func instanceof GList){
            return func
        }
        if(Array.isArray(func)){
            return GList.from(func)
        }
        // console.log(func)
        this.func = func // func = (this, index) => element
        this.get_size = typeof get_size == "function" ? get_size : (() => this._findOutLength(get_size))
        this.list = []
        this.size = size

        this.type = "list"
    }
    get length(){
        if(this.size === null){
            if(this.get_size !== null){
                this.size = this.get_size()
            }else{
                this.size = this._findOutLength()
                this.get_size = () => this.size
            }
        }
        return this.size
    }
    _findOutLength(max_length = Infinity){
        let i;
        for(i = 0; i <= max_length; i++){
            if(i in this.list){
                continue
            }
            else{
                try{
                    this.func(this, i)
                }
                catch(e){
                    if(!(e instanceof GListError)) throw e
                    return i
                }
            }
        }
        return i
    }
    _isLengthGreaterThan(compare_len){
        for(let i = 0; true; i++){
            if(i > compare_len) return true
            // return true
            try{
                // this.at(i)
                if(i < 0){ throw new GListError("index too small") }
                if(!(i in this.list)) this.func(this, i)
                
            }catch(e){
                if(!(e instanceof GListError)) throw e
                return false
            }
        }
    }
    isFullyEvaluated(){
        let evaluated = 0
        this.list.forEach(_ => evaluated++)
        // console.log(evaluated, this.length())
        return evaluated === this.length
    }
    toString(max_elements = Infinity){
        return "[" + this.take(max_elements).to_array().map(x => x.toString()).join(", ") + "]"
    }
    toRawString(max_elements = Infinity){
        let arr = this.map(x => x.toRawString?.() ?? x.toString())
        if(max_elements == Infinity) return "[" + arr.to_array().join(", ") + "]"
        let str = arr.to_array().join(", ") + ", ... ]"
        try{
            this.at(max_elements)
            return "[" + str + ", ... ]"
        }catch(e){
            if(!(e instanceof GListError)) throw e
            return "[" + str + "]"
        }
        // return "[" + this.take(max_elements).to_array().map(x => x.toRawString?.() ?? x.toString()).join(", ") + "]"
    }
    equals(other){
        return (other instanceof GList) && this.get_size() == other.get_size() && GList.zipWith((x, y) => x.equals(y), this, other).all()
    }
    compareTo(other){
        if(other instanceof GList){
            if(other.get_size() == 0) return this.get_size() == 0 ? 0 : 1
            if(this.get_size() == 0) return other.get_size() == 0 ? 0 : -1
            let compare_head = this.head().compareTo(other.head())
            if(compare_head == 0){
                return this.tail().compareTo(other.tail())
            }
            return compare_head
            // return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        }
        throw new TypeError(`can't compare ${this.type} with ${other.type ?? other}`)
    }
    isInt(){return false}
    isFloat(){return false }
    isString(){return false }
    isList(){ return true}
    toBool(){
        return this._isLengthGreaterThan(0)
    }
    at(index){
        if(index >= this.length) throw new GListError("index too large")
        if(index < 0){
            throw new GListError("index too small")
        }
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
        return new GList(get_at, () => this.get_size()) // could be incorrect
    }
    // fix !! doesn't work !!
    take_while(predicate){
        let taken = []
        let last_index = 0
        const get_at = (self, index) => {
            for(let _i = Math.min(index, taken.length); _i <= index; _i++){
                if(!predicate(this.at(_i))){
                    throw new GListError("index too large")
                }
                taken.push(this.at(_i))
            }
            return taken[index]
        }
        return new GList(get_at, () => this.get_size()) // could be incorrect
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
        return new GList(get_at, () => num)
        return new GList(get_at, () => {
            if(this._isLengthGreaterThan(num)) return num
            return this.get_size()
        })
    }
    // take_while(predicate){ // recurively defined
    //     // const get_at = (self, index) => {    
    //     //     if(predicate(this.at(index))){
    //     //         if(index == 0) return this.at(index) // base case here
    //     //         if(predicate(this.at(index - 1))) return this.at(index) // recursion here
    //     //         throw new GListError("index too large")
    //     //     }
    //     //     throw new GListError("index too large")
    //     // }
    //     // return new GList(get_at, () => this.get_size())
    //     const get_at = (self, index) => {
    //         if(index == 0 && predicate(this.at(0))) return this.at(0) // base case here
    //         // if(predicate(this.at(index - 1))) return this.at(index) // recursion here
    //         if(predicate(self.at(index - 1))) return this.at(index) // recursion here
    //         throw new GListError("index too large")
    //     }
    //     return new GList(get_at, () => this.get_size())    
    // }
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
        return new GList(get_at)
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
    prepend(value){
        const get_at = (self, index) => {
            return index == 0 ? value : this.at(index - 1)
        }
        return new GList(get_at, () => this.get_size() + 1)
    }
    append(value){
        const get_at = (self, index) => {
            try{
                return this.at(index)
            }
            catch(e){
                if(!(e instanceof GListError)) throw e
                
                if(index == this.get_size()) return value
                throw e

            }
        }
        return new GList(get_at, () => this.get_size() + 1)
    }
    to_array(max_elements = Infinity){ // todo: respect max_elements
        let arr = []
        for(let i = 0; i < Math.min(this.length, max_elements); i++){
            try{
                arr.push(this.at(i))
            }catch(e){
                if(!(e instanceof GListError)) throw e
                this.get_size = () => i
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
    force_evaluate_deep(){
        this.list = this.to_array()
        this.list.forEach(x => {
            if(x instanceof GList) x.force_evaluate_deep()
        })
    }
    reduce(...args){
        return this.to_array().reduce(...args)
    }
    fold(...args){
        return this.reduce(...args)
    }
    scan(...args){
        let func = args[0]
        let this_ = this
        const get_at = (self, index) => {
            if(index == 0){
                return this_.at(0)
            }
            return func(self.at(index - 1), this_.at(index))
        }
        return new GList(get_at, () => this.get_size())
    }
    transpose(){
        let self = this
        const get_at = (self1, index1) => {
            const get_at2 = (self2, index2) => {
                return this.at(index2).at(index1)
            
            }
            return new GList(get_at2, () => self.get_size())
        }
        return new GList(get_at, () => this.at(0).get_size())
    }
    reverse(){
        const get_at = (self, index) => {
            return this.at(self.get_size() - index - 1)
        }
        return new GList(get_at, () => this.get_size())
    }
    inits(){
        return GList.zipWith((_, len) => this.take(len), this, GList.naturals).take(this.get_size())
    }
    tails(){
        return GList.zipWith((_, len) => this.drop(len - 1), this, GList.naturals).take(this.get_size())
    }
    all(func = x => x){
        return this.to_array().every(func)
    }
    any(func = x => x){
        return this.to_array().some(func)
    }
    sort(func = (a, b) => a.compareTo(b)){
        // const f = (self) => {
        // if(self.length() < 2) return self
        // let pivot = self.head()
        // // console.log(pivot)
        // let less_than_or_equal = self.tail().filter(el => func(el, pivot) <= 0)
        // let greater_than = self.tail().filter(el => func(el, pivot) == 1)
        
        // let result = less_than_or_equal.call(x => x.sort(func)).concat(greater_than.call(x => x.sort(func)).prepend(pivot)).take(self.length())
        // console.log(self.get_size())
        // console.log(result)
        // console.log(++GList.global_i)
        
        const _sort = self => {
            return GList.from(self.to_array().sort(func))
        }

        return this.call(_sort)
    }
    slicesOfLength(len){
        const get_at = (self, index) => {
            const get_at2 = (self2, index2) => {
                return this.at(index * len + index2)
            }
            return new GList(get_at2, () => len)
        }

        return new GList(get_at, () => this.get_size() / len)
    }
    consSlicesOfLength(len){
        const get_at = (self, index) => {
            const get_at2 = (self2, index2) => {
                return this.at(index + index2)
            }
            return new GList(get_at2, () => len)
        }

        return new GList(get_at, () => this.get_size() - len + 1)
    }
    get [Symbol.iterator](){
        return function*(){
            let i = 0;
            while(true){
                try{
                    yield this.at(i)
                }
                catch(e){
                    if(!(e instanceof GListError)) throw e
                    break
                }
                i++
            }
        }
    }
    static zipWith(func, a, b){
        const get_at = (self, index) => {
            return func(a.at(index), b.at(index))
        }
        return new GList(get_at, () => Math.min(a.get_size(), b.get_size()))
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
        return new GList(get_at, () => arr.length)
    }
    static iterate(func, start_val){
        const get_at = (self, index) => {
            if(index == 0) return start_val
            return func(self.at(index - 1))
        }
        return new GList(get_at, () => Infinity)
    }
    static pure(element){
        return GList.from([element])
    }

    static naturals = new GList((_, i) => i + 1, () => Infinity)
    static reals = new GList((_, i) => 0 + (((i & 1) << 1) -1) * ((i + 1) >> 1), () => Infinity)
    static empty = GList.from([])
}

class GBlock {
    constructor(b){
        this.value = b
        this.type = "block"
    }
    toString(){
        return "{ " + this.value.map(e => e.type == "func" ? e.value : e.toString()).join(" ") + " }"
    }
    toRawString(){
        return this.toString()
    }
    toBool(){
        return true
    }
    equals(other){
        return (other instanceof GInt) && other.value == this.value
    }
    compareTo(other){
        if(other instanceof GInt) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        if(other instanceof GFloat) return this.value < other.value ? -1 : this.value > other.value ? 1 : 0
        throw new TypeError(`can't compare ${this.type} with ${other.type ?? other}`)
    }
    isInt(){ return true}
    isFloat(){ return false}
    isString(){ return false}
    isList(){ return false}
}

module.exports = {
    GInt,
    GFloat,
    GString,
    GList,
    GBlock,
    GListError
}