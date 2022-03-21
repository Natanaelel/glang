const { XMLHttpRequest } = require("xmlhttprequest")

const wait = async (time = 1000) => new Promise((resolve, reject) => setTimeout(resolve, time))

async function w(){
    await wait()
    return
}


const web_get = url => {
    let request = new XMLHttpRequest()
    request.open("GET", url, false)
    request.send()
    return request.responseText ?? ""
}

let url = "https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Synchronous_and_Asynchronous_Requests"
url = "https://www.google.com/"
console.log(1)

console.log(web_get(url).slice(0,20))


console.log(2)

