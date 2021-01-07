const start = require('../helpers/start')
const { randomIntFromInterval, scrollDown } = require("../helpers/helpers")

const getArticles = async (page) => {
    await scrollDown(page)

    return await page.evaluate(() => {
        const products = document.querySelectorAll('.producttile-wrapper')
        const formated = Array.from(products).map(product => {
            const image = product.querySelector("img")

            const title = product.querySelector(".product-title")
            const price = product.querySelector(".m-product-price")
            if (image.src === "//:0") {
                return null
            }


            return {
                image: image.src,
                title: title.innerText,
                price: price.innerText,
                product_link: title.parentElement.href,
                hqImage: image.src
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)

    await page.goto(url);
    await page.waitFor('.producttile-wrapper')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length < 50) {
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