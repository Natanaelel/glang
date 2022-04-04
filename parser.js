const fromEscapedChar = char => {
	return {
		"\\n": "\n",
		"\\t": "\t",
		"\\\\": "\\",
		"\\f": "\f",
		"\\r": "\r",
		"\\b": "\b",
	}[char] ?? char
}

const patterns = [
    {"type": "whitespace", "pattern": /^\s+/},
	{"type": "float", "pattern": /^\d+\.\d*/, "process": m => ({"token": parseFloat(m[0]), "length": m[0].length})},
	{"type": "int", "pattern": /^\d+/, "process": m => ({"token": parseInt(m[0]), "length": m[0].length})},
	{"type": "string", "pattern": /^"(.*?)("|$)/, "process": m => ({"token": m[1], "length": m[0].length})},
	{"type": "string", "pattern": /^'(\\.|.|\s)/, "process": m => ({"token": fromEscapedChar(m[1]), "length": m[0].length})},
	{"type": "special", "pattern": /^[{}]/},
	{"type": "func", "pattern": /^[a-z_]+/i},
]


function tokenize(code, mode = null, verbose = false){
    let tokens = []
	let patterns_to_use = mode == "verbose" ? patterns : patterns.concat([{"type": "func", "pattern": /^./}])
	W: while(code.length > 0){
        for(let {type, pattern, process} of patterns_to_use){
            if(m = code.match(pattern)){
                if(process){
                    let {token, length} = process(m)
					tokens.push({
                        "type": type,
						"value": token
					})
					code = code.slice(length)
				}else{
                    tokens.push({
                        "type": type,
						"value": m[0]
					})
					code = code.slice(m[0].length)
				}
				continue W
			}
		}
		console.log("couldn't tokenize", code)
		break
	}
	return tokens
}
function parse(tokens){
    let parsed = []
	W: while(tokens.length > 0){
        let token = tokens.shift()
		let {type, value} = token
		if(type == "whitespace") continue W
		if(type == "int"){
            parsed.push(token)
			continue W
		}
		if(type == "float"){
            parsed.push(token)
			continue W
		}
		if(type == "char"){
            parsed.push(fromEscapedChar(token))
			continue W
		}
		if(type == "string"){
            parsed.push(token)
			continue W
		}
		if(type == "special" && value == "{"){
            let [func, rest] = parseFunc(tokens)
			parsed.push({
                "type": "block",
				"value": func
			})
			tokens = rest
			continue W
		}
		parsed.push(token)

		// break
	}
	return parsed
}

function parseFunc(tokens){
    let func = []
	while(tokens.length > 0){
        let token = tokens.shift()
		let {type, value} = token
		if(type == "special" && value == "}"){
            return [func, tokens]
		}
		else if(type == "special" && value == "{"){
            let [t_func, rest] = parseFunc(tokens)
			func.push({
                "type": "block",
				"value": t_func
			})
			tokens = rest
		}
		else{
			func.push(token)
		}
	}
	console.error("error")
	console.error(func)
	console.error(tokens)
	return [func, tokens]
}

// module.exports = code => parse(tokenize(code).filter(a => a.type != "whitespace"))
module.exports = (code, verbose = false) => {
	code = code.replace(/\r/g,"")
	let tokenized = tokenize(code)
	if(verbose) console.log(tokenized)
	let parsed = parse((tokenized.filter(a => a.type != "whitespace")))
	if(verbose) console.log(parsed)
	return parsed
}
// let code = "1 2 3 * +"

// console.log(tokenize(code))