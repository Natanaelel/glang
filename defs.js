const add_nums = (a, b) => a + b
const sum = (arr) => arr.reduce((a,b)=>a+b,0)
const concat = (arr) => arr.reduce((a,b)=>a.concat(b))
const sort_nums = (arr) => arr.sort((a, b) => a - b)
const sort_strings = (arr) => arr.sort()
const reverse_list = (arr) => arr.reverse()
const reverse_string = (arr) => arr.split("").reverse().join("")
const maximum_nums = (arr) => Math.max(...arr)
const minimum_nums = (arr) => Math.min(...arr)
const maximum_strings = (arr) => arr.reduce((a, b) => a > b ? a : b)
const minimum_strings = (arr) => arr.reduce((a, b) => a < b ? a : b)
const transpose = (arr) => arr[0].map((x,i)=>a.map(r=>r[i]))
const product = (arr) => arr.reduce((a, b) => a * b, 1)
const length = (arr) => arr.length
const abs = (a) => Math.abs(a)
const range = (a) => Array(a).fill().map((_, i) => i + 1)
const split_string = (a, b) => a.split(b)
const split_element = (a, b) => 0

const max_by = (arr, func) => {
    if(arr.length == 0) return
    let max = arr[0]
    let max_val = func(max)
    for(let el of arr){
        if(func(el) > max_val){
            max = el
            max_val = func(el)
        }
    }
    return max
}


module.exports = {
    add_nums,
    sum,
    concat,
    sort_nums,
    sort_strings,
    reverse_list,
    reverse_string,
    maximum_nums,
    minimum_nums,
    maximum_strings,
    minimum_strings,
    transpose,
    product,
    length,
    abs,
    range,
    split_string,
    max_by
}