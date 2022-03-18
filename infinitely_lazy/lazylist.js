class Lazylist {
    constructor(func, get_length){
        this.func = func// func = (this, index) => element
        this.get_length = get_length || (() => this.toArray().length)
        this.list = []
    }
    at(index){
        if(index >= this.get_length()) throw new RangeError("index too large")
        if(index < 0) throw new RangeError("index too small")
        
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
        return new Lazylist(get_at, this.get_length)
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
        return new Lazylist(get_at, this.get_length)
    }
    head(){
        return this.at(0)
    }
    tail(){
        const get_at = (self, index) => this.at(index + 1)
        return new Lazylist(get_at, () => this.get_length() - 1)
    }
    take(num){
        const get_at = (self, index) => this.at(index)
        return new Lazylist(get_at, () => Math.min(num, this.get_length()))
    }
    takeWhile(predicate){
        let filtered = []
        let last_index = 0
        let final_length = this.get_length()
        const get_at = (self, index) => {
            if(index >= filtered.length){
                for(let _i = filtered.length; _i <= index; _i++){
                    let do_push = true
                    while(!predicate(this.at(last_index))){
                        console.log(final_length, ", ", last_index)
                        final_length = Math.min(final_length, last_index)
                        console.log(final_length, ": ", last_index)
                        
                        last_index += 1
                        do_push = false
                    }
                    if(do_push) filtered.push(this.at(last_index))
                    if(do_push) last_index += 1
                }
            }
            return filtered[index]
        }
        console.log(final_length)
        console.log(this.get_length())
        return new Lazylist(get_at, () => Math.min(final_length, this.get_length()))
    }
    drop(num){
        const get_at = (self, index) => this.at(index + num)
        return new Lazylist(get_at, () => this.get_length() - num)
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
        return new Lazylist(get_at, this.get_length)
    }
    concat(other){
        const get_at = (self, index) => {
            try{
                return this.at(index)
            }
            catch(e){
                if(!(e instanceof RangeError)) throw e
                return other.at(index - this.get_length())
            }
        }
        return new Lazylist(get_at, () => this.get_length() + other.get_length())
    }
    toArray(){
        let arr = []
        let i = 0
        while(true){
            try{
                arr.push(this.at(i++))
            }catch(e){
                if(!(e instanceof RangeError)) throw e
                return arr
            }
        }
        // return Array(this.get_length()).fill().map((_, i) => this.at(i))
    }
    static repeat(element){
        return new Lazylist(() => element, () => Infinity)
    }
    static cycle(list){
        const get_at = (self, index) => {
            return list.at(index % list.length)
        }
        return new Lazylist(get_at, () => Infinity)
    }
    static from(arr){
        const get_at = (self, index) => {
            return arr[index]
        }
        return new Lazylist(get_at, () => arr.length)
    }
    static iterate(func, start_val){
        const get_at = (self, index) => {
            if(index == 0) return start_val
            return func(self.at(index - 1))
        }
        return new Lazylist(get_at, () => Infinity)
    }
    static naturals = new Lazylist((_, i) => i + 1, () => Infinity)
    static reals = new Lazylist((_, i) => 0 + (((i & 1) << 1) -1) * ((i + 1) >> 1), () => Infinity)
    // static
}


const is_prime = n => {
    if(n <= 1) return false
    if(n <= 3) return true
    for(let i = 2; i < n; i++){
        if(n % i == 0) return false
    }
    return true
}

const prims = (a) => {
    let p = a.head()
    let xs = a.drop(1)
    return Lazylist.from([p]).concat(xs.filter(x => x % p != 0).call(prims))
}
pgen = prims(Lazylist.naturals.drop(1))
/*
// console.time("a")
// console.log(pgen.take(1000).toArray())
// console.timeEnd("a")

// console.time("b")
// console.log(Lazylist.naturals.filter(is_prime).take(1000).toArray())
// console.timeEnd("b")
*/
const collatz = n => [n / 2, n * 3 + 1][n % 2]

let seq = Lazylist.iterate(collatz, 12345)

let arr = seq.takeWhile(x => x != 1)


// console.log(arr.toArray())
// console.log(arr.toArray().length)

const primes = Lazylist.naturals.filter(is_prime)

console.log8prime
