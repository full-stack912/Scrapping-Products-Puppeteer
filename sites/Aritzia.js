const start = require('../helpers/start')
const { randomIntFromInterval, scrollDown } = require("../helpers/helpers")

const getArticles = async (page) => {
    await scrollDown(page)
    
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product-tile')
        const salesPage = window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            if (image.src.includes("f7f7f7.jpg")) { console.log("f7f7f7 image"); return null }
            if (salesPage) {
                price = product.querySelector(".ar-product__price-single > .strike")
                sale_price = product.querySelector(".js-product__sales-price")
            } else {
                price = product.querySelector(".js-product__sales-price")
            }
            const title = product.querySelector(".product-brand > h6 > a")

            const link = product.querySelector("a")
            const hqImage = image.src

            if (!title) { console.log('no title'); return null }
            if (!price) { console.log('no price'); return null }
            if (!image) { console.log('no image'); return null }

            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                product_link: link.href,
                sale_price: sale_price ? sale_price.innerText : null,
                hqImage
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)
    await page.goto(url);
    await page.waitFor('.product-tile')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 56) {
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