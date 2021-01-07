const { go } = require("./proxy_helper")
const uuid = require('uuid')
const crypto = require('crypto');
const path = require('path')
const fs = require('fs')
const screenshot = require('../helpers/screenshot')

const puppeteer = require('puppeteer-extra')
 
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())


module.exports = async (proxy = false) => {
    let profile_path
    // if(startChrome) {
    //     puppeteer = require("puppeteer")
    // } else {
    //     puppeteer = require("puppeteer-firefox")
    //     profile_path = path.join(process.cwd(), `state/firefox`)
    // }
    // if(!startChrome) {
    //     opts['userDataDir'] = profile_path
    // }

    const isProd = process.env.NODE_ENV === 'production'

    const args = [
        '--no-sandbox',
        // '--disable-setuid-sandbox',
        // '--disable-infobars',
        // '--window-size=1366,768',

    ]

    proxy && args.push(`--proxy-server=${proxy}`)

    const opts = {
        args,
        headless: true,
    }

    const browser = await puppeteer.launch(opts);
    const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.59 Safari/537.36';
    let page = await browser.newPage();
    // await page.setUserAgent(userAgent);
    page.setDefaultTimeout(120000)

    await page.setViewport({
        width: 1366,
        height: 768,
        deviceScaleFactor: 1
    });

    const handleClose = async (msg) => {
        // await screenshot(page, msg)
        console.log(msg)
        page.close();
        browser.close();
        process.exit(1);
    }

    process.on("uncaughtException", (reason, p) => {
        const a = `Possibly Unhandled Exception at: Promise , ${p}, reason: , ${reason}`
        handleClose(a);
    });

    process.on("unhandledRejection", (reason, p) => {
        const a = `Possibly Unhandled Exception at: Promise , ${p}, reason: , ${reason}`
        handleClose(a);
    });
    // browser.on('disconnected', () => {
    //     console.log('sleeping 100ms'); //  sleep to eliminate race condition
    //     setTimeout(function () {
    //         console.log(`Browser Disconnected... Process Id: ${process}`);
    //         child_process.exec(`kill -9 ${process}`, (error, stdout, stderr) => {
    //             if (error) {
    //                 console.log(`Process Kill Error: ${error}`)
    //             }
    //             console.log(`Process Kill Success. stdout: ${stdout} stderr:${stderr}`);
    //         });
    //     }, 100);
    // })


    return [page, browser]

}
