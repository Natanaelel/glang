class List {
    constructor(list){
        this._head = null
        this._tail = null
        if(list.length > 0) this._head = list[0]
        if(list.length > 1) this._tail = new List(list.slice(1))
    }
    head(){
        if(this.head !== null){
            return this._head
        }
        throw new Error("EmptyListError")
    }
    tail(){
        if(this.tail !== null){
            return this._tail
        }
        throw new Error("EmptyListError")
    }

    static nil(){
        return new List([])
    }
    static cons(head, tail){
        return new List([head, ...tail])
    }
    static thunk(){
        return () => this.nil()
    }

    static isNil(list){
        return list._head === null
    }

    static force(list){
        if(this.isNil(list)){
            
        }
    }
}


let arr = [1,2,3,4]
let n = new List(arr)

console.log(arr)

console.log(n)
console.log(n.head())
console.log(n.tail())


