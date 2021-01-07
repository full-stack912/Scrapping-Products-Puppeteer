var shell = require('shelljs');
const proxyHelper = require("./helpers/proxy_helper")

const go = async (skipProxy) => {
    const file = process.argv[3]
    console.log(process.argv)
    
    const site = require(`./sites/${file}.js`)

    // const proxy = await proxyHelper.go()
    const proxy = false
    const res = await site(process.argv[4], proxy)

    process.stdout.write("data:" + JSON.stringify(res))
    process.stdout.end()
    // process.stdout.write("data:" + JSON.stringify(res[0]))
}


const exec = require("child_process").execSync
try {
    shell.exec("pkill -f chrome")
} catch (e) {
    
}

try {
    shell.exec("pkill -f firefox")
} catch (e) {
    
}

try {
    shell.exec("rm state/firefox/lock")
} catch (e) {
}

try {
    go()
} catch(err) {
    console.error("Failed at: ", process.argv[3])
}