const start = require('../helpers/start')
const { randomIntFromInterval, scrollDown } = require("../helpers/helpers")
const proxyHelper = require("./helpers/proxy_helper")

const getArticles = async (page) => {
    
    console.log("scrolling down")
    await scrollDown(page)

    return await page.evaluate(() => {
        const products = document.querySelectorAll(".product-card")

        const salesPage = window.location.href.includes("26190") || window.location.href.includes("26061")
        console.log(444, salesPage)
        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            const link = product.querySelector(".product-card__link")
            const title = product.querySelector(".product-card__name")
            if (salesPage) {
                price = product.querySelector(".product-price__strike")
                sale_price = product.querySelector(".product-price__highlight")
            } else {
                price = product.querySelector(".product-price__highlight")
            }

            if (!price) {
                console.log("missign price", price, product)
            } else if (!title) {
                console.log("missign title")
            } else if (!link) {
                console.log("missign link")
            }
            if (!price || !title || !link) { return null }

            // const b = image.src.split("$mainline_")
            // const hqImage = `${b[0]}$mainline_pdp_desktop_zoom$`
            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                hqImage: image.src,
                product_link: link.href,

            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(await proxyHelper.go())
    await page.goto(url);
    await page.waitFor(".product-card")
    // await page.waitFor(500000)

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 60) {
        let newArticles = await getArticles(page)
        if (!Array.isArray(newArticles)) {
            newArticles = newArticles._v
        }
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
