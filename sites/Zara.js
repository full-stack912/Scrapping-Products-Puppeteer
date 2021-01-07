const start = require('../helpers/start')
const { randomIntFromInterval } = require("../helpers/helpers")

const getArticles = async (page) => {
    return await page.evaluate(() => {
        const products = document.querySelectorAll('.product')
        const womenSalesPage = window.location.pathname.includes("woman-special-prices")
        const manSalesPage = window.location.pathname.includes("man-special-prices")

        const formated = Array.from(products).map(product => {
            let price, sale_price

            const image = product.querySelector("img")
            if (image.src.includes("transparent-") || !image.src.includes("/w/") || image == null) { return null }

            const title = product.querySelector(".name")
            if (!title) { return null }

            if (womenSalesPage) {
                // price = product.querySelector(".c-product-meta__original-price")
                sale_price = product.querySelector(".price._product-price")
            } else if (manSalesPage) {
                const prices = product.querySelector(".price._product-price").querySelectorAll("span")
                price = prices[0]
                sale_price = prices[1]
            } else {
                price = product.querySelector(".price")
            }

            // if(!price){return null}
            const link = product.querySelector("a")

            const b = image.src.split("/w/")
            const c = b[1].split("/")
            const d = `${b[0]}/w/900/${c[1]}`

            // https://static.zara.net/photos///2020/V/0/2/p/1887/411/533/22/w/292/1887411533_2_4_1.jpg?ts=1587664974237
            // -->
            // https://static.zara.net/photos///2020/V/0/2/p/1887/411/533/22/w/1146/1887411533_2_4_1.jpg?ts=1587664974237

            // https://static.zara.net/photos///2020/V/M/2/p/0000/006/116/2/w/292/0000006116_1_1_1.jpg?ts=1587655014067
            // -->
            // https://static.zara.net/photos///2020/V/0/2/p/1887/411/533/44/w/1146/1887411533_2_1_1.jpg?ts=1587479677138

            return {
                image: image.src,
                title: title.innerText,
                price: price ? price.innerText : null,
                sale_price: sale_price ? sale_price.innerText : null,
                product_link: link.href,
                hqImage: d
            }
        })
        return Promise.resolve(formated.filter(x => x))

    });
}

module.exports = async (url, proxy) => {
    const [page, browser] = await start(proxy)

    console.error(`goto ${url}`)
    await page.goto(url);

    console.error(`waitFor'.product`)
    await page.waitFor('.product')

    let data = []

    const startTime = Date.now();
    let scheduledDuration = 60000

    console.error("getting articles")
    while (((Date.now() - startTime) < scheduledDuration) && data.length <= 60) {
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