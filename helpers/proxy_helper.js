const axios = require('axios')

const go = async () => {
    const url = "https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list.txt"
    let data = await axios.get(url)
    data = data.data
    var regex = /([0-9]{1,3}\.){3}[0-9]{1,3}(:[0-9]{2,4})?/g
    const proxyList = data.match(regex)
    Array.prototype.randomElement = function () {
        return this[Math.floor(Math.random() * this.length)]
    }
    return proxyList.randomElement()
}

module.exports = { go }
// (async () => {
//     await go()
// })();
