const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product-tile')
        const salesPage = window.location.pathname.includes("sale")

        const formated = Array.from(products).map(product => {
            let price, sale_price
            const image = product.querySelector("img")
          
            if (image == null || image.src.includes("data:image")) { return null }

            const title = product.querySelector(".product-link")
            if (!title) { return null }


            const link = product.querySelector(".product-link")
            if (salesPage) {
                price = product.querySelector("span[itemprop='price']")
                price = product.querySelector("span[itemprop='price']")
            } else {
                price = product.querySelector("span[itemprop='price']")
            }
            if (!price || !image) { return null }
            const b = image.src.split(".jpg?")
            const c = b[1]
            const sw = parseInt(c.split("sw=")[1])
            const sh = parseInt(c.split("sh=")[1])
            const hqImage = `${b[0]}.jpg?sw=${sw * 2}&sh=${sh * 2}`

            return {
                image: image.src,
                title: title.innerText,
                price: price ? price.innerText : null,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: link.href,
                hqImage
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, _proxy) => {
    const [page, browser] = await start()
        
    console.error(`goto ${url}`)
    await page.goto(url);

    console.error(`waitFor'.product-tile`)
    await page.waitFor('.product-tile')

    let data = []

    const startTime = Date.now();
    let scheduled_duration = 60000

    while (((Date.now() - startTime) < scheduled_duration) && data.length <= 30) {
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
        console.error(data.length)
        await page.waitFor(randomIntFromInterval(500, 2000))
    }


    await browser.close();
    return data
}