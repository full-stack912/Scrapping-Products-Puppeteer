const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.js-product-container')
        const salesPage = window.location.pathname.includes("sale")

        console.log("collecting")
        const formated = Array.from(products).map(product => {
            let price, sale_price
            
            const image = product.querySelector("img")
            if (!image) { return null }

            const title = product.querySelector(".js-product-item-title")

            if (!title) { return null }


            const link = product.querySelector(".image-container.js-image-container")
            if (salesPage) {
                price = product.querySelector(".product-item__price.js-product-item-price")
                sale_price = product.querySelector(".special-price")
            } else {
                price = product.querySelector(".product-item__price.js-product-item-price")
            }
            if (image.src.includes("categoryimg") || !price || !image) { return null }
            

            if (!price) {
                console.log("missing price", price, product)
            } else if (!title) {
                console.log("missing title")
            } else if (!link) {
                console.log("missing link")
            }
            if (!price || !title || !link) { return null }

            return {
                image: image.src,
                title: title.innerText,
                price: price ? price.innerText : null,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: link.href,
                hqImage: image.src
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)
 
    console.log(`goto ${url}`)
    await page.goto(url);
 
    console.log(`wait for .js-product-container`)
    await page.waitFor('.js-product-container')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length <= 60) {
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
        await page.waitFor(randomIntFromInterval(500, 2000))
    }


    await browser.close();
    return data
}