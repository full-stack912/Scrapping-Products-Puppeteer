const start = require('../helpers/start')
const {randomIntFromInterval} = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.js-product-tile')
        const salesPage =  window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price
            const image = product.querySelector("img")

            const title = product.querySelector("h3")
            if(salesPage) {
                price = product.querySelector(".c-product-meta__original-price")
                sale_price = product.querySelector(".c-product-meta__current-price")
            } else {
                price = product.querySelector(".c-product-meta__current-price")
            }
            if(image.src.includes("loading-spacer") || !title || !price) {return null}

            const b = image.src.split("_a?")
            const hqImage = b[0] + "_a?$a15-pdp-detail-shot$&hei=900&qlt=80&fit=constrain"
            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: title.parentElement.href,
                hqImage
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)
    await page.goto(url);
    await page.waitFor('.js-product-tile')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 60) {
        let newArticles = await getArticles(page)
 if(!Array.isArray(newArticles)) {
            newArticles = newArticles._v
        }
newArticles.forEach(article => {
            const alreadyAdded = data.find(x => x.title === article.title)
            if(!alreadyAdded) {
                data.push(article)
            }
        })

        for (let i = 0; i < randomIntFromInterval(5,15); i++) {
            await page.evaluate(e => window.scrollBy(0, 100));
        }
        console.log(data.length)
        await page.waitFor(randomIntFromInterval(0,1000))
    }


    await browser.close();
    return data
}