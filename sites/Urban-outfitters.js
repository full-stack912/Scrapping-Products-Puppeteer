const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll("div.c-pwa-tile-grid-inner")

        const salesPage = window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")

            const title = product.querySelector(".c-pwa-product-tile__heading")
            
            if (salesPage) {
                price = product.querySelector(".c-pwa-product-price__original")
                sale_price = product.querySelector(".c-pwa-product-price__current")
            } else {
                price = product.querySelector(".c-pwa-product-price__current")
            }
            // console.log(price, title)
            if (image == null || image.src.includes("loading-spacer") || !price || !title) { return null }

            const b = image.src.split("_b?")
            const hqImage = b[0] + "_b?$a15-pdp-detail-shot$&hei=900&qlt=80&fit=constrain"
            
            const titleLink = product.querySelector(".c-pwa-product-tile__link")

            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: titleLink.href,
                hqImage
            }
        })
        return Promise.resolve(formated.filter(x => x))
    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)

    console.log(`goto ${url}`)
    await page.goto(url);

    console.log(`waitFor .c-pwa-tile-grid-inner`)
    await page.waitFor(".c-pwa-tile-grid-inner")

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 60) {
        let newArticles = await getArticles(page)
        console.log(2, newArticles)
        if (!Array.isArray(newArticles)) {
            newArticles = newArticles._v
        }
        newArticles.forEach(article => {
            const alreadyAdded = data.find(x => x.title === article.title)
            if (!alreadyAdded) {
                data.push(article)
            }
        })
        // console.log(1, newArticles)
        newArticles.forEach(article => {
            const alreadyAdded = data.find(x => x.title === article.title)
            if (!alreadyAdded) {
                data.push(article)
            }
        })
        for (let i = 0; i < randomIntFromInterval(5, 15); i++) {
            await page.evaluate(e => window.scrollBy(0, 100));
        }
        console.log(data.length)
        await page.waitFor(randomIntFromInterval(0, 1000))
    }


    await browser.close();
    return data
}