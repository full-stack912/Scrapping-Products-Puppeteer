const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product-tile')
        const formated = Array.from(products).map(product => {
            const image = product.querySelector("img")
            const title = product.querySelector(".product__name")
            if (!title) { return null }
            const price = product.querySelector(".product__price")
            const link = product.querySelector("a")
            // const hqImage = image.src.replace(/Large/ig, 'Hires');
            const hqImage = image.src

            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                product_link: link.href,
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
    
    await page.waitFor(10000)

    let data = []

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


    await browser.close();
    return data
}